using System;
using System.ComponentModel;
using System.Formats.Asn1;
using System.IO;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Security.Cryptography.Pkcs;
using System.Security.Cryptography.X509Certificates;

namespace Letterier.Release {
    // Read-only verifier for our single-signer SHA-256 embedded PE release.
    // Does not install roots, access private keys, or execute the subject file.
    public sealed class EmbeddedProof {
        public bool DigestValid { get; set; }
        public bool CmsValid { get; set; }
        public bool TimestampValid { get; set; }
        public DateTimeOffset Timestamp { get; set; }
    }
    public static class EmbeddedSignature {
        const string Sha256 = "2.16.840.1.101.3.4.2.1";
        const string SpcIndirect = "1.3.6.1.4.1.311.2.1.4";
        const string TimestampOid = "1.3.6.1.4.1.311.3.3.1";
        [StructLayout(LayoutKind.Sequential)] struct Blob { public uint Size; public IntPtr Data; }
        [StructLayout(LayoutKind.Sequential)] struct Algorithm { public IntPtr Oid; public Blob Parameters; }
        [StructLayout(LayoutKind.Sequential)] struct Attribute { public IntPtr Oid; public Blob Value; }
        [StructLayout(LayoutKind.Sequential)] struct Indirect { public Attribute Data; public Algorithm Algorithm; public Blob Digest; }
        [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)] struct Subject {
            public uint Size; public IntPtr Type; public IntPtr File;
            [MarshalAs(UnmanagedType.LPWStr)] public string FileName;
            public IntPtr DisplayName; public uint Reserved1, Version; public IntPtr Provider;
            public Algorithm Algorithm; public uint Flags, Encoding, Reserved2, Capi, Security, Index, UnionChoice;
            public IntPtr Additional, Client;
        }
        [DllImport("crypt32.dll", CharSet=CharSet.Unicode, SetLastError=true)]
        static extern bool CryptSIPRetrieveSubjectGuid(string file, IntPtr handle, out Guid guid);
        [DllImport("crypt32.dll", SetLastError=true)]
        static extern bool CryptSIPGetSignedDataMsg(ref Subject subject, out uint encoding, uint index, ref uint size, byte[] data);
        [DllImport("crypt32.dll", SetLastError=true)]
        static extern bool CryptSIPCreateIndirectData(ref Subject subject, ref uint size, IntPtr data);
        static void Require(bool condition, string message) { if (!condition) throw new CryptographicException(message); }
        static void Native(bool ok, string operation) {
            if (!ok) throw new CryptographicException(operation + " failed (" + Marshal.GetLastWin32Error() + ").");
        }
        static byte[] CopyBlob(Blob blob) {
            Require(blob.Size == 32 && blob.Data != IntPtr.Zero, "Invalid SHA-256 digest size.");
            byte[] result = new byte[32]; Marshal.Copy(blob.Data, result, 0, result.Length); return result;
        }
        public static EmbeddedProof Verify(string path, byte[] expectedCertificate, bool requireTimestamp) {
            Require(OperatingSystem.IsWindows(), "Windows SIP verification is required.");
            using (var lockedFile = File.Open(path, FileMode.Open, FileAccess.Read, FileShare.Read)) {
                Require(lockedFile.ReadByte() == 0x4d && lockedFile.ReadByte() == 0x5a, "PE image required.");
                lockedFile.Position = 0;
                Guid guid; Native(CryptSIPRetrieveSubjectGuid(path, IntPtr.Zero, out guid), "SIP subject lookup");
                IntPtr guidMemory = Marshal.AllocHGlobal(Marshal.SizeOf<Guid>());
                IntPtr algorithmOid = Marshal.StringToHGlobalAnsi(Sha256);
                IntPtr indirectMemory = IntPtr.Zero;
                try {
                    Marshal.StructureToPtr(guid, guidMemory, false);
                    var subject = new Subject { Size=(uint)Marshal.SizeOf<Subject>(), Type=guidMemory,
                        File=new IntPtr(-1), FileName=path, Encoding=0x10001,
                        Algorithm=new Algorithm { Oid=algorithmOid } };
                    uint size=0, encoding;
                    Native(CryptSIPGetSignedDataMsg(ref subject, out encoding, 0, ref size, null), "Embedded signature lookup");
                    Require(size > 0 && size <= 4*1024*1024, "Embedded signature size outside supported bounds.");
                    byte[] encoded = new byte[size];
                    Native(CryptSIPGetSignedDataMsg(ref subject, out encoding, 0, ref size, encoded), "Embedded signature read");
                    // The Windows PE SIP size query includes the 8-byte
                    // WIN_CERTIFICATE header on the observed SDK/runtime; the
                    // retrieval reports only the CMS bytes actually written.
                    Require(size > 0 && size <= encoded.Length, "Invalid embedded signature read length.");
                    Array.Resize(ref encoded, (int)size);
                    var cms = new SignedCms(); cms.Decode(encoded);
                    Require(cms.ContentInfo.ContentType.Value == SpcIndirect && cms.SignerInfos.Count == 1, "Single Authenticode signer required.");
                    var signer = cms.SignerInfos[0];
                    Require(signer.Certificate != null && CryptographicOperations.FixedTimeEquals(signer.Certificate.RawData, expectedCertificate), "Embedded signer does not match the pinned public certificate.");
                    Require(signer.DigestAlgorithm.Value == Sha256, "SHA-256 CMS signature required.");
                    cms.CheckSignature(true); // Crypto only; private self-signed root is pinned above, not installed.
                    var content = new AsnReader(cms.ContentInfo.Content, AsnEncodingRules.BER);
                    var sequence = content.ReadSequence();
                    sequence.ReadEncodedValue(); // SpcAttributeTypeAndOptionalValue.
                    var digestInfo = sequence.ReadSequence();
                    var algorithm = digestInfo.ReadSequence();
                    Require(algorithm.ReadObjectIdentifier() == Sha256, "SHA-256 PE digest required.");
                    if (algorithm.HasData) algorithm.ReadNull();
                    algorithm.ThrowIfNotEmpty();
                    byte[] expectedDigest = digestInfo.ReadOctetString();
                    digestInfo.ThrowIfNotEmpty(); sequence.ThrowIfNotEmpty(); content.ThrowIfNotEmpty();
                    uint indirectSize=0;
                    Native(CryptSIPCreateIndirectData(ref subject, ref indirectSize, IntPtr.Zero), "PE digest size");
                    Require(indirectSize >= Marshal.SizeOf<Indirect>() && indirectSize <= 1024*1024, "Invalid indirect data size.");
                    indirectMemory = Marshal.AllocHGlobal((int)indirectSize);
                    Native(CryptSIPCreateIndirectData(ref subject, ref indirectSize, indirectMemory), "PE digest computation");
                    var actual = Marshal.PtrToStructure<Indirect>(indirectMemory);
                    Require(Marshal.PtrToStringAnsi(actual.Algorithm.Oid) == Sha256, "Unexpected SIP digest algorithm.");
                    Require(CryptographicOperations.FixedTimeEquals(CopyBlob(actual.Digest), expectedDigest), "PE digest mismatch.");
                    var proof = new EmbeddedProof { DigestValid=true, CmsValid=true };
                    Rfc3161TimestampToken timestamp = null;
                    foreach (CryptographicAttributeObject attribute in signer.UnsignedAttributes) {
                        Require(attribute.Oid.Value != "1.3.6.1.4.1.311.2.4.1", "Nested release signatures are not supported.");
                        if (attribute.Oid.Value != TimestampOid) continue;
                        Require(timestamp == null && attribute.Values.Count == 1, "Exactly one RFC3161 timestamp is supported.");
                        int consumed;
                        Require(Rfc3161TimestampToken.TryDecode(attribute.Values[0].RawData, out timestamp, out consumed)
                            && consumed == attribute.Values[0].RawData.Length, "Invalid RFC3161 token.");
                    }
                    if (requireTimestamp) Require(timestamp != null, "RFC3161 timestamp required.");
                    if (timestamp != null) {
                        X509Certificate2 tsa;
                        Require(timestamp.VerifySignatureForSignerInfo(signer, out tsa, timestamp.AsSignedCms().Certificates), "RFC3161 signature or imprint mismatch.");
                        Require(tsa != null && timestamp.TokenInfo.HashAlgorithmId.Value == Sha256, "SHA-256 RFC3161 token required.");
                        var time = timestamp.TokenInfo.Timestamp;
                        Require(time <= DateTimeOffset.UtcNow.AddMinutes(5), "RFC3161 time is in the future.");
                        Require(time.UtcDateTime >= signer.Certificate.NotBefore.ToUniversalTime() && time.UtcDateTime <= signer.Certificate.NotAfter.ToUniversalTime(), "Signer certificate was not valid at timestamp time.");
                        using (var chain = new X509Chain()) {
                            chain.ChainPolicy.VerificationTime = time.UtcDateTime;
                            chain.ChainPolicy.VerificationFlags = X509VerificationFlags.NoFlag;
                            chain.ChainPolicy.RevocationMode = X509RevocationMode.Online;
                            chain.ChainPolicy.RevocationFlag = X509RevocationFlag.ExcludeRoot;
                            chain.ChainPolicy.UrlRetrievalTimeout = TimeSpan.FromSeconds(15);
                            chain.ChainPolicy.ApplicationPolicy.Add(new Oid("1.3.6.1.5.5.7.3.8"));
                            chain.ChainPolicy.ExtraStore.AddRange(timestamp.AsSignedCms().Certificates);
                            Require(chain.Build(tsa), "RFC3161 TSA certificate chain validation failed.");
                        }
                        proof.TimestampValid=true; proof.Timestamp=time;
                    }
                    return proof;
                } finally {
                    if (indirectMemory != IntPtr.Zero) Marshal.FreeHGlobal(indirectMemory);
                    Marshal.FreeHGlobal(algorithmOid); Marshal.FreeHGlobal(guidMemory);
                }
            }
        }
    }
}

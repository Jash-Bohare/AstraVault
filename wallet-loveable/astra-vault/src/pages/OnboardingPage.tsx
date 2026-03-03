import { useState } from "react";
import { Shield, Plus, Download, ArrowRight, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "../store/WalletContext";
import { generateMnemonic, derivePrivateKey, privateKeyToAddress } from "../core/wallet";
import { encryptPrivateKey } from "../utils/crypto";
import { toast } from "sonner";

export default function OnboardingPage() {
    const [step, setStep] = useState<"choice" | "create" | "import">("choice");
    const [mnemonic, setMnemonic] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [copied, setCopied] = useState(false);
    const { setWalletState } = useWallet();
    const navigate = useNavigate();

    const handleStartCreate = () => {
        setMnemonic(generateMnemonic());
        setStep("create");
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(mnemonic);
        setCopied(true);
        toast.success("Mnemonic copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFinishCreate = async () => {
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        try {
            const encrypted = await encryptPrivateKey(mnemonic, password);
            const pk = await derivePrivateKey(mnemonic, 0);
            const address = privateKeyToAddress(pk);
            const accounts = [{ address, index: 0 }];

            localStorage.setItem("wallet", JSON.stringify({
                ...encrypted,
                isMnemonic: true,
                address,
                accounts
            }));

            setWalletState({
                mnemonic,
                accounts,
                activeAddress: address,
                privateKey: pk
            });
            toast.success("Wallet created successfully!");

            // Enforce Dashboard landing without destructive reload
            setTimeout(() => {
                navigate("/");
            }, 500);
        } catch (err) {
            console.error(err);
            toast.error("Failed to create wallet");
        }
    };

    const handleImport = async () => {
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        try {
            const encrypted = await encryptPrivateKey(mnemonic, password);
            const pk = await derivePrivateKey(mnemonic, 0);
            const address = privateKeyToAddress(pk);
            const accounts = [{ address, index: 0 }];

            localStorage.setItem("wallet", JSON.stringify({
                ...encrypted,
                isMnemonic: true,
                address,
                accounts
            }));

            setWalletState({
                mnemonic,
                accounts,
                activeAddress: address,
                privateKey: pk
            });
            toast.success("Wallet imported successfully!");

            // Enforce Dashboard landing without destructive reload
            setTimeout(() => {
                navigate("/");
            }, 500);
        } catch (err) {
            console.error(err);
            toast.error("Invalid mnemonic or failed to import");
        }
    };

    return (
        <div className="h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden font-outfit">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.05] pointer-events-none"
                style={{ background: 'radial-gradient(circle, hsl(186 100% 50%) 0%, transparent 70%)' }}
            />

            <div className="w-full max-w-md z-10">
                {step === "choice" && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center mb-6 shadow-lg border border-primary/20 shadow-primary/5">
                                <Shield className="w-10 h-10 text-primary" />
                            </div>
                            <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2">Astra Vault</h1>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-60">Secure entry to the decentralized web.</p>
                        </div>

                        <div className="grid gap-6">
                            <button
                                onClick={handleStartCreate}
                                className="glass p-6 rounded-[2.5rem] text-left border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all duration-500 group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                                <div className="relative z-10 flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform shrink-0 shadow-lg shadow-primary/5">
                                        <Plus className="w-7 h-7 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-xl font-black text-foreground tracking-tight">Create Wallet</h2>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60 mt-1 leading-relaxed">Generate a new 12-word seed phrase</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => {
                                    setMnemonic("");
                                    setPassword("");
                                    setConfirmPassword("");
                                    setStep("import");
                                }}
                                className="glass p-6 rounded-[2.5rem] text-left border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all duration-500 group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                                <div className="relative z-10 flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform shrink-0 shadow-lg shadow-primary/5">
                                        <Download className="w-7 h-7 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-xl font-black text-foreground tracking-tight">Import Wallet</h2>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60 mt-1 leading-relaxed">Restore from an existing mnemonic</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {step === "create" && (
                    <div className="glass border border-white/5 rounded-[2.5rem] p-10 space-y-8 animate-fade-in shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />

                        <div className="relative z-10 space-y-2 text-center">
                            <h2 className="text-2xl font-black text-foreground tracking-tighter">Backup Recovery Phrase</h2>
                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-60">Store these 12 words safely</p>
                        </div>

                        <div className="grid grid-cols-3 gap-3 bg-white/5 p-6 rounded-[2rem] border border-white/5 relative group shadow-inner">
                            {mnemonic.split(" ").map((word, i) => (
                                <div key={i} className="flex gap-2 text-xs">
                                    <span className="text-primary/40 font-black text-[9px] w-4">{i + 1}.</span>
                                    <span className="font-bold text-foreground/90">{word}</span>
                                </div>
                            ))}
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl hover:bg-primary/10 text-primary"
                                onClick={handleCopy}
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/5 relative z-10">
                            <div className="space-y-2">
                                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] ml-1 opacity-60">Security Access Key</p>
                                <Input
                                    type="password"
                                    placeholder="Enter vault password"
                                    className="glass-input h-12 px-5 rounded-xl border-white/5 font-mono text-sm shadow-inner"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] ml-1 opacity-60">Confirm Protocol Key</p>
                                <Input
                                    type="password"
                                    placeholder="Repeat vault password"
                                    className="glass-input h-12 px-5 rounded-xl border-white/5 font-mono text-sm shadow-inner"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            <Button
                                onClick={handleFinishCreate}
                                className="w-full h-12 glow-cyan-strong font-black text-[9px] uppercase tracking-widest gap-2 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                                disabled={!password || password !== confirmPassword}
                            >
                                Secure Identity <ArrowRight className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full text-[9px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                                onClick={() => {
                                    setMnemonic("");
                                    setPassword("");
                                    setConfirmPassword("");
                                    setStep("choice");
                                }}
                            >
                                Abort Initialization
                            </Button>
                        </div>
                    </div>
                )}

                {step === "import" && (
                    <div className="glass border border-white/5 rounded-[2.5rem] p-10 space-y-8 animate-fade-in shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />

                        <div className="relative z-10 space-y-2 text-center">
                            <h2 className="text-2xl font-black text-foreground tracking-tighter">Restore Wallet</h2>
                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-60">Enter your 12-word phrase</p>
                        </div>

                        <textarea
                            className="relative z-10 w-full h-32 glass border border-white/10 p-6 rounded-[2rem] focus:border-primary/40 outline-none resize-none text-[11px] font-mono font-bold tracking-tight bg-white/5 shadow-inner leading-relaxed transition-all selection:bg-primary/20"
                            placeholder="Enter your 12 or 24 word phrase here..."
                            value={mnemonic}
                            onChange={(e) => setMnemonic(e.target.value)}
                        />

                        <div className="space-y-4 relative z-10">
                            <div className="space-y-2">
                                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] ml-1 opacity-60">Security Access Key</p>
                                <Input
                                    type="password"
                                    placeholder="Master access key"
                                    className="glass-input h-12 px-5 rounded-xl border-white/5 font-mono text-sm shadow-inner"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] ml-1 opacity-60">Confirm Identity Key</p>
                                <Input
                                    type="password"
                                    placeholder="Repeat access key"
                                    className="glass-input h-12 px-5 rounded-xl border-white/5 font-mono text-sm shadow-inner"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            <Button
                                onClick={handleImport}
                                className="w-full h-12 glow-cyan-strong font-black text-[9px] uppercase tracking-widest gap-2 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                                disabled={!mnemonic || !password || password !== confirmPassword}
                            >
                                Reconstruct Identity <ArrowRight className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full text-[9px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                                onClick={() => {
                                    setMnemonic("");
                                    setPassword("");
                                    setConfirmPassword("");
                                    setStep("choice");
                                }}
                            >
                                Back to Protocol
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

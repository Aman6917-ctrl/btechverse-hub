import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getFirestoreDb } from "@/integrations/firebase/config";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { generateRoomCode, STUDY_ROOMS_COLLECTION } from "@/lib/study-room";
import { Users, ArrowRight, Loader2 } from "lucide-react";

export default function StudyRoomHub() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const authRedirect = `/auth?redirect=${encodeURIComponent("/study")}`;
  const [topic, setTopic] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [creating, setCreating] = useState(false);

  const displayName =
    user?.displayName?.trim() ||
    user?.email?.split("@")[0]?.trim() ||
    "Student";

  const handleCreate = async () => {
    if (!user?.uid) {
      navigate(authRedirect);
      return;
    }
    setCreating(true);
    const db = getFirestoreDb();
    try {
      for (let attempt = 0; attempt < 10; attempt++) {
        const code = generateRoomCode(6);
        const ref = doc(db, STUDY_ROOMS_COLLECTION, code);
        const snap = await getDoc(ref);
        if (snap.exists()) continue;
        await setDoc(ref, {
          topic: topic.trim() || "Study session",
          createdAt: serverTimestamp(),
          createdBy: user.uid,
          hostName: displayName,
          timer: null,
        });
        toast({ title: "Room ready", description: `Code: ${code} — share with friends.` });
        navigate(`/study/room/${code}`);
        return;
      }
      toast({ variant: "destructive", title: "Try again", description: "Could not allocate a room code." });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Firestore error",
        description: e instanceof Error ? e.message : "Check Firestore rules for studyRooms.",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = () => {
    const code = joinCode.replace(/\s/g, "").toUpperCase();
    if (!user) {
      const loginRedirect =
        code.length >= 4
          ? `/auth?redirect=${encodeURIComponent(`/study/room/${code}`)}`
          : authRedirect;
      navigate(loginRedirect);
      return;
    }
    if (code.length < 4) {
      toast({ variant: "destructive", title: "Invalid code", description: "Enter the room code your friend shared." });
      return;
    }
    navigate(`/study/room/${code}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container max-w-lg mx-auto px-4 py-12 pt-24">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-3">
            <Users className="h-7 w-7" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 tracking-tight">Group study rooms</h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
            Create a room, share the code, and study together—chat in the room, video in our built-in meeting.
          </p>
        </div>

        <div className="space-y-6 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm p-6 shadow-sm ring-1 ring-border/40">
          {!authLoading && !user && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-center space-y-2">
              <p className="text-sm text-foreground">Sign in to create or join a study room.</p>
              <Button asChild className="w-full sm:w-auto">
                <Link to={authRedirect}>Log in / Sign up</Link>
              </Button>
            </div>
          )}
          <div className="space-y-3">
            <Label htmlFor="topic">Topic (optional)</Label>
            <Input
              id="topic"
              placeholder="e.g. DBMS — Unit 3"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              maxLength={80}
            />
            <Button className="w-full" onClick={handleCreate} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating…
                </>
              ) : (
                <>
                  Create room & get code
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or join</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="code">Room code</Label>
            <Input
              id="code"
              placeholder="e.g. XK7M2A"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="font-mono tracking-widest uppercase"
              maxLength={10}
            />
            <Button variant="secondary" className="w-full" onClick={handleJoin}>
              Join room
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Share the code with your group. Once you&apos;re in the room, hit Join video meeting to start the call.
          </p>
        </div>

        <p className="text-center mt-6 text-sm text-muted-foreground">
          <Link to="/" className="text-primary underline-offset-4 hover:underline">
            Back to home
          </Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}

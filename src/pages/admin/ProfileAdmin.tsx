import { useState } from "react";
import { useProfileData } from "@/hooks/useProfileData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { UserCheck, Save, RotateCcw, Youtube } from "lucide-react";

export default function ProfileAdmin() {
  const { profile, updateProfile, resetProfile } = useProfileData();
  const [form, setForm] = useState(profile);

  const handleSave = () => {
    updateProfile(form);
    toast.success("Profile & Biography data saved successfully!");
  };

  const handleReset = () => {
    if (!confirm("Reset to default verified profile info?")) return;
    resetProfile();
    setForm(profile);
    toast.success("Profile reset to defaults");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2.5">
            <UserCheck className="w-7 h-7 text-primary" />
            <span>Profile &amp; Biography Customizer</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Edit full biographical details, family information, education, ventures, and social profiles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-1.5" />
            Reset Defaults
          </Button>
          <Button onClick={handleSave} className="bg-primary text-primary-foreground">
            <Save className="w-4 h-4 mr-1.5" /> Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Biography Information */}
        <div className="space-y-4 p-5 rounded-xl border border-border bg-card">
          <h2 className="text-lg font-semibold border-b border-border pb-2">Core Identity</h2>

          <div>
            <Label>Full Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div>
            <Label>Title / Tagline</Label>
            <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Birth Date</Label>
              <Input value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
            </div>
            <div>
              <Label>Birth Location</Label>
              <Input value={form.birthPlace} onChange={(e) => setForm({ ...form, birthPlace: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Father's Name</Label>
              <Input value={form.father} onChange={(e) => setForm({ ...form, father: e.target.value })} />
            </div>
            <div>
              <Label>Mother's Name</Label>
              <Input value={form.mother} onChange={(e) => setForm({ ...form, mother: e.target.value })} />
            </div>
          </div>

          <div>
            <Label>Higher Education</Label>
            <Input value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} />
          </div>

          <div>
            <Label>School</Label>
            <Input value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} />
          </div>

          <div>
            <Label>Founded Companies</Label>
            <Input value={form.ventures} onChange={(e) => setForm({ ...form, ventures: e.target.value })} />
          </div>

          <div>
            <Label>Verified Biography Paragraph</Label>
            <Textarea
              rows={6}
              value={form.bioText}
              onChange={(e) => setForm({ ...form, bioText: e.target.value })}
              className="text-xs leading-relaxed"
            />
          </div>
        </div>

        {/* Social & Channel Links */}
        <div className="space-y-4 p-5 rounded-xl border border-border bg-card">
          <h2 className="text-lg font-semibold border-b border-border pb-2">Official Channels &amp; Links</h2>

          <div className="rounded-lg p-3 bg-red-500/10 border border-red-500/20 space-y-2">
            <Label className="text-red-400 font-semibold flex items-center gap-1.5">
              <Youtube className="w-4 h-4 text-red-500" />
              Official YouTube Channel
            </Label>
            <Input
              value={form.youtubeChannel}
              onChange={(e) => setForm({ ...form, youtubeChannel: e.target.value })}
              placeholder="https://www.youtube.com/channel/UCejecdsURkKqMAa9UCy9eZw"
              className="bg-black/30"
            />
          </div>

          <div>
            <Label>Facebook Profile</Label>
            <Input value={form.facebook} onChange={(e) => setForm({ ...form, facebook: e.target.value })} />
          </div>

          <div>
            <Label>X / Twitter</Label>
            <Input value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} />
          </div>

          <div>
            <Label>Instagram</Label>
            <Input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} />
          </div>

          <div>
            <Label>LinkedIn</Label>
            <Input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} />
          </div>

          <div>
            <Label>GitHub</Label>
            <Input value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} />
          </div>

          <div>
            <Label>Deezer Verified Artist</Label>
            <Input value={form.deezer} onChange={(e) => setForm({ ...form, deezer: e.target.value })} />
          </div>

          <div>
            <Label>Spotify Artist</Label>
            <Input value={form.spotify} onChange={(e) => setForm({ ...form, spotify: e.target.value })} />
          </div>

          <div>
            <Label>Chaptra Author</Label>
            <Input value={form.chaptra} onChange={(e) => setForm({ ...form, chaptra: e.target.value })} />
          </div>

          <div>
            <Label>Google Scholar</Label>
            <Input value={form.scholar} onChange={(e) => setForm({ ...form, scholar: e.target.value })} />
          </div>

          <div>
            <Label>Contact Inquiries Email</Label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>

          <div className="pt-2">
            <Button onClick={handleSave} className="w-full">
              Save All Profile Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

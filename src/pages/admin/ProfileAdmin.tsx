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
    <div className="space-y-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#dadce0] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#202124] flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-[#e37400]" />
            <span>Profile &amp; Biography</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#5f6368] mt-0.5">
            Edit full biographical details, family information, education, ventures, and official social links.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="border-[#dadce0] text-[#5f6368] hover:bg-[#f1f3f4] h-8 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset Defaults
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#e37400] hover:bg-[#d56b00] text-white text-xs sm:text-sm font-medium rounded-full px-4 h-8 shadow-sm"
          >
            <Save className="w-4 h-4 mr-1.5" /> Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Biography Information */}
        <div className="space-y-4 p-4 sm:p-5 rounded-xl border border-[#dadce0] bg-white shadow-xs">
          <h2 className="text-base font-bold text-[#202124] border-b border-[#f1f3f4] pb-2">Core Identity</h2>

          <div>
            <Label className="text-xs font-semibold text-[#5f6368]">Full Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 bg-white border-[#dadce0] text-[#202124]"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold text-[#5f6368]">Title / Tagline</Label>
            <Input
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              className="mt-1 bg-white border-[#dadce0] text-[#202124]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-[#5f6368]">Birth Date</Label>
              <Input
                value={form.birthDate}
                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                className="mt-1 bg-white border-[#dadce0] text-[#202124]"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-[#5f6368]">Birth Location</Label>
              <Input
                value={form.birthPlace}
                onChange={(e) => setForm({ ...form, birthPlace: e.target.value })}
                className="mt-1 bg-white border-[#dadce0] text-[#202124]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-[#5f6368]">Father&apos;s Name</Label>
              <Input
                value={form.father}
                onChange={(e) => setForm({ ...form, father: e.target.value })}
                className="mt-1 bg-white border-[#dadce0] text-[#202124]"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-[#5f6368]">Mother&apos;s Name</Label>
              <Input
                value={form.mother}
                onChange={(e) => setForm({ ...form, mother: e.target.value })}
                className="mt-1 bg-white border-[#dadce0] text-[#202124]"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-[#5f6368]">Higher Education</Label>
            <Input
              value={form.education}
              onChange={(e) => setForm({ ...form, education: e.target.value })}
              className="mt-1 bg-white border-[#dadce0] text-[#202124]"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold text-[#5f6368]">School</Label>
            <Input
              value={form.school}
              onChange={(e) => setForm({ ...form, school: e.target.value })}
              className="mt-1 bg-white border-[#dadce0] text-[#202124]"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold text-[#5f6368]">Founded Companies</Label>
            <Input
              value={form.ventures}
              onChange={(e) => setForm({ ...form, ventures: e.target.value })}
              className="mt-1 bg-white border-[#dadce0] text-[#202124]"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold text-[#5f6368]">Verified Biography Paragraph</Label>
            <Textarea
              rows={6}
              value={form.bioText}
              onChange={(e) => setForm({ ...form, bioText: e.target.value })}
              className="mt-1 text-xs leading-relaxed bg-white border-[#dadce0] text-[#202124]"
            />
          </div>
        </div>

        {/* Social & Channel Links */}
        <div className="space-y-4 p-4 sm:p-5 rounded-xl border border-[#dadce0] bg-white shadow-xs">
          <h2 className="text-base font-bold text-[#202124] border-b border-[#f1f3f4] pb-2">
            Official Channels &amp; Links
          </h2>

          <div className="rounded-lg p-3 bg-[#fce8e6]/60 border border-red-200 space-y-2">
            <Label className="text-[#d93025] font-semibold flex items-center gap-1.5 text-xs">
              <Youtube className="w-4 h-4 text-[#d93025]" />
              Official YouTube Channel
            </Label>
            <Input
              value={form.youtubeChannel}
              onChange={(e) => setForm({ ...form, youtubeChannel: e.target.value })}
              placeholder="https://www.youtube.com/channel/UCejecdsURkKqMAa9UCy9eZw"
              className="bg-white border-red-200 text-[#202124] text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-[#5f6368]">Facebook Profile</Label>
              <Input
                value={form.facebook}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                className="mt-1 bg-white border-[#dadce0] text-[#202124] text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-[#5f6368]">X / Twitter</Label>
              <Input
                value={form.twitter}
                onChange={(e) => setForm({ ...form, twitter: e.target.value })}
                className="mt-1 bg-white border-[#dadce0] text-[#202124] text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-[#5f6368]">Instagram</Label>
              <Input
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                className="mt-1 bg-white border-[#dadce0] text-[#202124] text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-[#5f6368]">LinkedIn</Label>
              <Input
                value={form.linkedin}
                onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                className="mt-1 bg-white border-[#dadce0] text-[#202124] text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-[#5f6368]">GitHub</Label>
              <Input
                value={form.github}
                onChange={(e) => setForm({ ...form, github: e.target.value })}
                className="mt-1 bg-white border-[#dadce0] text-[#202124] text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-[#5f6368]">Deezer Verified Artist</Label>
              <Input
                value={form.deezer}
                onChange={(e) => setForm({ ...form, deezer: e.target.value })}
                className="mt-1 bg-white border-[#dadce0] text-[#202124] text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-[#5f6368]">Spotify Artist</Label>
              <Input
                value={form.spotify}
                onChange={(e) => setForm({ ...form, spotify: e.target.value })}
                className="mt-1 bg-white border-[#dadce0] text-[#202124] text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-[#5f6368]">Chaptra Author</Label>
              <Input
                value={form.chaptra}
                onChange={(e) => setForm({ ...form, chaptra: e.target.value })}
                className="mt-1 bg-white border-[#dadce0] text-[#202124] text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-[#5f6368]">Google Scholar</Label>
              <Input
                value={form.scholar}
                onChange={(e) => setForm({ ...form, scholar: e.target.value })}
                className="mt-1 bg-white border-[#dadce0] text-[#202124] text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-[#5f6368]">Contact Inquiries Email</Label>
              <Input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 bg-white border-[#dadce0] text-[#202124] text-xs"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleSave}
              className="w-full bg-[#e37400] hover:bg-[#d56b00] text-white font-medium rounded-xl"
            >
              <Save className="w-4 h-4 mr-1.5" /> Save All Profile Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

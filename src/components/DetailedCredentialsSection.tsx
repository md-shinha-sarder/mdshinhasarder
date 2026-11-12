import { FileText, ExternalLink, Disc, BookOpen, GraduationCap, Building2 } from "lucide-react";

export const DetailedCredentialsSection = () => {
  return (
    <div className="w-full my-6 bg-white border border-[#e2e8f0] rounded-[14px] shadow-[0_8px_24px_rgba(15,23,42,0.07)] p-6 sm:p-8 font-['Poppins','Karla',sans-serif] text-[#334155]">
      {/* Action Buttons: Preview CV & Knowledge Panel */}
      <div className="flex flex-wrap items-center gap-3.5 mb-8 pb-6 border-b border-[#e2e8f0]">
        <a
          href="https://drive.google.com/file/d/1b4uAYCgzzgpprCkI16KYS2ycPk1VBEXk/view"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium text-sm transition-all shadow-sm hover:shadow"
        >
          <FileText size={16} />
          <span>Preview CV</span>
        </a>
        <a
          href="https://share.google/8cHEzvrnE2uFpnlc3"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#1e2a38] border border-[#cbd5e1] font-medium text-sm transition-all"
        >
          <ExternalLink size={16} className="text-[#2563eb]" />
          <span>Knowledge Panel</span>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Organizations & Identity */}
        <div className="space-y-4">
          <h3 className="text-[18px] font-semibold text-[#0a4275] border-b-2 border-[#e2e8f0] pb-2 relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-[40px] after:h-[2px] after:bg-[#2563eb] flex items-center gap-2">
            <Building2 size={18} className="text-[#2563eb]" />
            <span>Organizations &amp; Identity</span>
          </h3>
          <ul className="space-y-2 text-sm text-[#475569]">
            <li>
              <strong className="text-[#1e2a38]">Organizations:</strong> IT Tech BD, Biostar
            </li>
            <li>
              <strong className="text-[#1e2a38]">Known For:</strong> Entrepreneur, Musical Artist, and Author
            </li>
            <li>
              <strong className="text-[#1e2a38]">Music Genre:</strong> Soundtracks, Country
            </li>
          </ul>
        </div>

        {/* Albums & Singles (2025) */}
        <div className="space-y-4">
          <h3 className="text-[18px] font-semibold text-[#0a4275] border-b-2 border-[#e2e8f0] pb-2 relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-[40px] after:h-[2px] after:bg-[#2563eb] flex items-center gap-2">
            <Disc size={18} className="text-[#2563eb]" />
            <span>Albums &amp; Singles (2025)</span>
          </h3>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-[#475569]">
            <li>No Stars Heard Our Pain</li>
            <li>Fading Love in Quiet Shadows</li>
            <li>Lost Between Love and Pride</li>
            <li>Love Whispered but You Left</li>
            <li>Pagol Mon Kra</li>
          </ul>
        </div>

        {/* Books Collection (2025) */}
        <div className="space-y-4">
          <h3 className="text-[18px] font-semibold text-[#0a4275] border-b-2 border-[#e2e8f0] pb-2 relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-[40px] after:h-[2px] after:bg-[#2563eb] flex items-center gap-2">
            <BookOpen size={18} className="text-[#2563eb]" />
            <span>Books Collection (2025)</span>
          </h3>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-[#475569]">
            <li>From Village to Virtual: The Journey of MD. Shinha Sarder</li>
            <li>ICT Fundamentals for the 21st Century Learn</li>
            <li>
              <a href="https://books.google.com.bd/books?id=_DZmEQAAQBAJ" target="_blank" rel="noreferrer" className="text-[#2563eb] hover:underline">
                Social Media Learner: Simple Guide
              </a>
            </li>
            <li>
              <a href="https://books.google.com.bd/books?id=8552EQAAQBAJ" target="_blank" rel="noreferrer" className="text-[#2563eb] hover:underline">
                Lifestyle of MD. Shinha Sarder
              </a>
            </li>
            <li>
              <a href="https://books.google.com.bd/books?id=pqd-EQAAQBAJ" target="_blank" rel="noreferrer" className="text-[#2563eb] hover:underline">
                The Musical Journey of MD. Shinha Sarder
              </a>
            </li>
            <li>
              <a href="https://books.google.com.bd/books?id=1nF-EQAAQBAJ" target="_blank" rel="noreferrer" className="text-[#2563eb] hover:underline">
                Mastering The Google Knowledge Panel
              </a>
            </li>
            <li>
              <a href="https://books.google.com.bd/books/about?id=y3KAEQAAQBAJ" target="_blank" rel="noreferrer" className="text-[#2563eb] hover:underline">
                The Musical Artist As a Shinha
              </a>
            </li>
            <li>
              <a href="https://books.google.com.bd/books/about?id=j6mAEQAAQBAJ" target="_blank" rel="noreferrer" className="text-[#2563eb] hover:underline">
                The Entrepreneur as a MD. Shinha Sarder
              </a>
            </li>
          </ul>
        </div>

        {/* Publications (2025) */}
        <div className="space-y-4">
          <h3 className="text-[18px] font-semibold text-[#0a4275] border-b-2 border-[#e2e8f0] pb-2 relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-[40px] after:h-[2px] after:bg-[#2563eb] flex items-center gap-2">
            <GraduationCap size={18} className="text-[#2563eb]" />
            <span>Publications (2025)</span>
          </h3>
          <ul className="space-y-2.5 text-sm text-[#475569]">
            <li>
              <strong className="block text-[#1e2a38]">Graph theory with applications to engineering and computer science</strong>
              <span className="text-xs text-[#64748b]">MDS Sarder, Courier Dover Publications</span>
            </li>
            <li>
              <strong className="block text-[#1e2a38]">Days of a Dreaming Boy: The Early Life of MD. Shinha Sarder</strong>
              <span className="text-xs text-[#64748b]">MDS Sarder, University Publisher</span>
            </li>
            <li>
              <strong className="block text-[#1e2a38]">From Khulna to the Cloud: A Young Creator’s Diary</strong>
              <span className="text-xs text-[#64748b]">MDS Sarder, MD. Shinha Sarder</span>
            </li>
            <li>
              <strong className="block text-[#1e2a38]">Computer and Technology: Mastering Modern Tech</strong>
              <span className="text-xs text-[#64748b]">MDS Sarder, Rafi Publisher Ltd</span>
            </li>
            <li>
              <strong className="block text-[#1e2a38]">MD. Shinha Sarder - Biography</strong>
              <a href="https://peoplepill.com/i/md-shinha-sarder" target="_blank" rel="noreferrer" className="text-xs text-[#2563eb] hover:underline">
                MDS Sarder, PeoplePill
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DetailedCredentialsSection;

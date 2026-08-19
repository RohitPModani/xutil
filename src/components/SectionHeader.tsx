import React from "react";
import InfoSection from "./InfoSection";
import { sectionInfo } from "../data/sectionInfo";

interface SectionHeaderProps {
  sectionKey: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ sectionKey }) => {
  return (
    <div className="flex items-center gap-2">
      <h3 className="section-title">
        {sectionInfo[sectionKey]?.title || "Section"}
      </h3>
      <InfoSection sectionKey={sectionKey} />
    </div>
  );
};

export default SectionHeader;

import { Zap } from "lucide-react";

const AnnouncementBar = () => {
  return (
    <div className="px-4">
      <div className="announcement-bar">
        <span className="update-badge">
          <Zap className="w-3.5 h-3.5" />
          আপডেট
        </span>
        <p className="text-sm text-muted-foreground truncate">
          আসসালামু আলাইকুম — রামগঞ্জ সেবায় স্বাগতম!
        </p>
      </div>
    </div>
  );
};

export default AnnouncementBar;

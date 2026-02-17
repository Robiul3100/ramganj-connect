import { Search } from "lucide-react";

const SearchBar = () => {
  return (
    <div className="px-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="কোন সেবাটি খুঁজছেন?"
          className="search-input pl-12"
        />
      </div>
    </div>
  );
};

export default SearchBar;

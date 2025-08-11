import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { availableTags } from "./filters/filterConstants";

interface TagsManagerProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

const TagsManager = ({ tags, onChange }: TagsManagerProps) => {
  const [newTag, setNewTag] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onChange([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const filteredSuggestions = useMemo(() => {
    const q = newTag.trim().toLowerCase();
    return availableTags
      .filter((t) => !tags.includes(t))
      .filter((t) => (q ? t.toLowerCase().includes(q) : true))
      .slice(0, 6);
  }, [newTag, tags]);

  const selectSuggestion = (s: string) => {
    if (!tags.includes(s)) {
      onChange([...tags, s]);
      setNewTag("");
      setShowSuggestions(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Adicionar tag"
          value={newTag}
          onChange={(e) => {
            setNewTag(e.target.value);
            setShowSuggestions(true);
          }}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button onClick={addTag} size="sm" variant="outline">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <fieldset aria-label="Sugestões de tags" className="flex flex-wrap gap-2 border-0 p-0 m-0">
          {filteredSuggestions.map((s) => (
            <Button
              key={s}
              type="button"
              size="sm"
              variant="secondary"
              className="h-7 px-2 text-xs bg-violet-50 text-violet-700 hover:bg-violet-100"
              onClick={() => selectSuggestion(s)}
            >
              + {s}
            </Button>
          ))}
        </fieldset>
      )}

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="flex items-center gap-1 bg-violet-100 text-violet-800 hover:bg-violet-200"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              aria-label={`Remover tag ${tag}`}
              className="ml-1 hover:text-violet-900 focus:outline-none focus:ring-2 focus:ring-violet-400 rounded"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default TagsManager;

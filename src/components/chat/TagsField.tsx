import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Tag {
  id: string;
  title: string;
  color: string;
}

interface TagsFieldProps {
  selectedChat: string | null;
}

const TagsField = ({ selectedChat }: TagsFieldProps) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagTitle, setNewTagTitle] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3b82f6");

  const predefinedColors = [
    "#3b82f6", // blue
    "#ef4444", // red
    "#10b981", // green
    "#f59e0b", // amber
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#84cc16", // lime
  ];

  const addTag = () => {
    if (!newTagTitle.trim()) return;

    const newTag: Tag = {
      id: Date.now().toString(),
      title: newTagTitle.trim(),
      color: newTagColor,
    };

    setTags([...tags, newTag]);
    setNewTagTitle("");
  };

  const removeTag = (tagId: string) => {
    setTags(tags.filter((tag) => tag.id !== tagId));
  };

  if (!selectedChat) {
    return null;
  }

  return (
    <Card className="p-4 mb-4">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
        Marcadores
      </h3>

      {/* Existing tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map((tag) => (
          <Badge
            key={tag.id}
            variant="outline"
            className="flex items-center gap-1 px-2 py-1"
            style={{
              backgroundColor: `${tag.color}20`,
              borderColor: tag.color,
              color: tag.color,
            }}
          >
            {tag.title}
            <Button
              variant="ghost"
              size="xs"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => removeTag(tag.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>

      {/* Add new tag */}
      <div className="flex gap-2 items-center">
        <Input
          placeholder="Novo marcador..."
          value={newTagTitle}
          onChange={(e) => setNewTagTitle(e.target.value)}
          className="flex-1 h-8"
          onKeyPress={(e) => e.key === "Enter" && addTag()}
        />

        {/* Color picker */}
        <div className="flex gap-1">
          {predefinedColors.map((color) => (
            <button
              key={color}
              className={`w-6 h-6 rounded-full border-2 ${
                newTagColor === color ? "border-gray-400" : "border-gray-200"
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setNewTagColor(color)}
            />
          ))}
        </div>

        <Button variant="outline" size="sm" onClick={addTag} className="h-8">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default TagsField;

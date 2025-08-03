import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Tag {
  id: string;
  title: string;
  color: string;
}

interface TagsFieldEditProps {
  contactId: string | null;
}

const TagsFieldEdit = ({ contactId }: TagsFieldEditProps) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newTagTitle, setNewTagTitle] = useState("");
  const [newTagColor, setNewTagColor] = useState("#3b82f6");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

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

  // Carregar tags do banco de dados
  useEffect(() => {
    if (contactId) {
      loadTags();
    }
  }, [contactId]);

  const loadTags = async () => {
    if (!contactId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("tags")
        .eq("id", contactId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      
      const parsedTags = parseTags(data?.tags);
      setTags(parsedTags);
    } catch (error) {
      console.error("Error loading tags:", error);
      toast({ 
        title: "Erro ao carregar etiquetas", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const parseTags = (tagsData: any): Tag[] => {
    if (!tagsData) return [];
    try {
      const parsed = typeof tagsData === "string" ? JSON.parse(tagsData) : tagsData;
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Error parsing tags:", error);
      return [];
    }
  };

  const saveTags = async (updatedTags: Tag[]) => {
    if (!contactId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("contacts")
        .update({ tags: JSON.stringify(updatedTags) })
        .eq("id", contactId);

      if (error) throw error;
    } catch (error) {
      console.error("Error saving tags:", error);
      toast({ 
        title: "Erro ao salvar etiquetas", 
        variant: "destructive" 
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const addTag = async () => {
    if (!newTagTitle.trim()) return;

    const newTag: Tag = {
      id: Date.now().toString(),
      title: newTagTitle.trim(),
      color: newTagColor,
    };

    const updatedTags = [...tags, newTag];
    setTags(updatedTags);
    setNewTagTitle("");

    try {
      await saveTags(updatedTags);
      toast({ 
        title: "Etiqueta adicionada com sucesso" 
      });
    } catch (error) {
      // Reverter em caso de erro
      setTags(tags);
    }
  };

  const removeTag = async (tagId: string) => {
    const updatedTags = tags.filter((tag) => tag.id !== tagId);
    const originalTags = [...tags];
    setTags(updatedTags);

    try {
      await saveTags(updatedTags);
      toast({ 
        title: "Etiqueta removida com sucesso" 
      });
    } catch (error) {
      // Reverter em caso de erro
      setTags(originalTags);
    }
  };

  if (!contactId) {
    return null;
  }

  if (loading) {
    return (
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-center py-4">
          <div className="h-4 w-4 border-2 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
          <span className="ml-2 text-sm text-gray-500">Carregando etiquetas...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 mb-4">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
        Etiquetas
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
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => removeTag(tag.id)}
              disabled={saving}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>

      {/* Add new tag */}
      <div className="flex gap-2 items-center">
        <Input
          placeholder="Nova Etiqueta..."
          value={newTagTitle}
          onChange={(e) => setNewTagTitle(e.target.value)}
          className="flex-1 h-8"
          onKeyPress={(e) => e.key === "Enter" && addTag()}
          disabled={saving}
        />

        {/* Color picker */}
        <div className="flex gap-1">
          {predefinedColors.map((color) => (
            <button
              key={color}
              className={`w-6 h-6 rounded-full border-2 ${
                newTagColor === color
                  ? "border-gray-400 dark:border-gray-300"
                  : "border-gray-200 dark:border-gray-600"
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setNewTagColor(color)}
              disabled={saving}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={addTag}
          disabled={saving || !newTagTitle.trim()}
          className="h-8 px-2"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {saving && (
        <div className="mt-2 text-xs text-gray-500 flex items-center">
          <div className="h-3 w-3 border border-t-transparent border-blue-600 rounded-full animate-spin mr-1"></div>
          Salvando...
        </div>
      )}
    </Card>
  );
};

export default TagsFieldEdit;
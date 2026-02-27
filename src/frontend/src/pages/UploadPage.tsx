import { useState, useRef } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { ArrowLeft, Upload, FileVideo, Loader2, CheckCircle2 } from "lucide-react";
import { useActor } from "../hooks/useActor";
import { ExternalBlob } from "../backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

type UploadState = "idle" | "uploading" | "success" | "error";

export function UploadPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { actor } = useActor();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video file");
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Please drop a valid video file");
      return;
    }
    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor || !selectedFile || !title.trim()) return;

    setUploadState("uploading");
    setUploadProgress(0);

    try {
      // Use object URL to avoid loading the entire file into memory at once
      const objectUrl = URL.createObjectURL(selectedFile);
      let externalBlob = ExternalBlob.fromURL(objectUrl).withUploadProgress(
        (percentage) => {
          setUploadProgress(percentage);
        }
      );

      // Upload to backend
      await actor.uploadVideo(title.trim(), description.trim(), externalBlob);
      URL.revokeObjectURL(objectUrl);

      setUploadState("success");
      setUploadProgress(100);
      toast.success("Video uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["videos"] });

      // Redirect after short delay
      setTimeout(() => {
        navigate({ to: "/" });
      }, 1500);
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadState("error");
      toast.error("Upload failed. Please try again.");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const isUploading = uploadState === "uploading";
  const isSuccess = uploadState === "success";

  return (
    <main className="container mx-auto px-4 py-8 animate-fade-up opacity-0">
      <div className="max-w-2xl mx-auto">
        {/* Back nav */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-primary transition-colors mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 duration-200" />
          Back to Videos
        </Link>

        {/* Page title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-0.5 w-8 bg-primary" />
            <span className="font-body text-xs uppercase tracking-widest text-muted-foreground">
              Admin Panel
            </span>
          </div>
          <h1 className="font-display text-5xl text-foreground">
            UPLOAD <span className="text-primary">VIDEO</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Drop Zone */}
          <div>
            <Label className="font-body text-sm font-medium text-foreground mb-2 block">
              Video File <span className="text-primary">*</span>
            </Label>
            <button
              type="button"
              className={`relative rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer w-full text-left ${
                selectedFile
                  ? "border-primary/60 bg-primary/5"
                  : "border-border hover:border-primary/40 bg-card"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              disabled={isUploading || isSuccess}
              aria-label="Select video file"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="sr-only"
                disabled={isUploading || isSuccess}
              />

              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                {selectedFile ? (
                  <>
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/30">
                      <FileVideo className="h-7 w-7 text-primary" />
                    </div>
                    <p className="font-body font-medium text-foreground text-sm">
                      {selectedFile.name}
                    </p>
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      {formatFileSize(selectedFile.size)}
                    </p>
                    {!isUploading && !isSuccess && (
                      <p className="font-body text-xs text-primary mt-2">
                        Click to change file
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted border border-border">
                      <Upload className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <p className="font-body font-medium text-foreground text-sm">
                      Drop video here or click to browse
                    </p>
                    <p className="font-body text-xs text-muted-foreground mt-1">
                      Supports MP4, MOV, AVI, MKV and other video formats
                    </p>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">
                      Recommended: 15–25 minute videos
                    </p>
                  </>
                )}
              </div>
            </button>
          </div>

          {/* Upload progress */}
          {isUploading && (
            <div className="space-y-2 animate-fade-up opacity-0">
              <div className="flex justify-between text-sm">
                <span className="font-body text-muted-foreground">Uploading...</span>
                <span className="font-body font-medium text-primary">{uploadProgress}%</span>
              </div>
              <div className="progress-glow">
                <Progress value={uploadProgress} className="h-2" />
              </div>
            </div>
          )}

          {/* Success state */}
          {isSuccess && (
            <div className="flex items-center gap-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 animate-fade-up opacity-0">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
              <p className="font-body text-sm text-emerald-400">
                Upload complete! Redirecting...
              </p>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="font-body text-sm font-medium text-foreground">
              Title <span className="text-primary">*</span>
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              disabled={isUploading || isSuccess}
              className="bg-card border-border focus:border-primary/60 focus:ring-primary/30 font-body"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="font-body text-sm font-medium text-foreground">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a brief description of the video..."
              disabled={isUploading || isSuccess}
              rows={4}
              className="bg-card border-border focus:border-primary/60 focus:ring-primary/30 font-body resize-none"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={!selectedFile || !title.trim() || isUploading || isSuccess}
            className="w-full gap-2 bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-glow-sm h-12 font-body font-medium text-base"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Uploading {uploadProgress}%...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Uploaded Successfully
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Upload Video
              </>
            )}
          </Button>
        </form>
      </div>
    </main>
  );
}

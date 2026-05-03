import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Upload, ImagePlus, Video, X, DollarSign,
  Tag, FileText, Layers, FileArchive, CheckCircle2, Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCreateProduct } from "@/hooks/useProducts";
import { toast } from "sonner";
import { api } from "@/lib/api";

const schema = z.object({
  title: z.string().min(5, "At least 5 characters"),
  description: z.string().min(20, "At least 20 characters"),
  category: z.string().min(1, "Choose a category"),
  price: z.coerce.number().min(1, "Minimum $1"),
  technologies: z.string().optional(),
  demoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  // sourceCodeUrl مش جزء من الـ form — بييجي من الـ upload
});
type Form = z.infer<typeof schema>;

const CATEGORIES = [
  "Dashboard", "E-commerce", "Chat App", "SaaS", "Landing Page",
  "Portfolio", "Admin Panel", "Mobile App", "API", "Other",
];

export default function Sell() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const createProduct = useCreateProduct();
  const [images, setImages] = useState<string[]>([""]);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const searchParams = new URLSearchParams(window.location.search);
  const editId = searchParams.get("edit");
  const [isUpdating, setIsUpdating] = useState(false);

  // ── ZIP upload state ──────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [uploadedZipUrl, setUploadedZipUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } =
    useForm<Form>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (editId) {
      Promise.all([
        api(`/products/${editId}`),
        api(`/products/${editId}/download`).catch(() => ({})),
      ]).then(([res, dlRes]: any) => {
        const p = res.data ?? res.product ?? res;
        if (p) {
          setValue("title", p.title);
          setValue("description", p.description);
          setValue("category", p.category);
          setValue("price", p.price ?? p.salePrice);
          setValue("technologies", p.techStack?.join(", ") || p.technologies?.join(", ") || "");
          setValue("demoUrl", p.demoUrl || "");
          // عند التعديل: لو فيه URL محفوظ نحتفظ بيه بدون إعادة رفع
          if (dlRes?.sourceCodeUrl) setUploadedZipUrl(dlRes.sourceCodeUrl);
          if (p.images?.length > 0) setImages(p.images);
        }
      }).catch(() => toast.error("Failed to load project details for editing"));
    }
  }, [editId, setValue]);

  if (!isAuthenticated) {
    return (
      <div className="py-24 text-center">
        <div className="text-5xl mb-4">🔐</div>
        <h2 className="text-xl font-bold mb-2">Login required</h2>
        <p className="text-muted-foreground mb-6">You need to be logged in to sell projects</p>
        <a href="/login"
          className="inline-block rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Login now
        </a>
      </div>
    );
  }

  // ── ZIP helpers ───────────────────────────────────────────────────
  async function handleZipSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".zip")) {
      toast.error("Please select a .zip file");
      return;
    }
    setZipFile(file);
    await uploadZip(file);
  }

  async function uploadZip(file: File) {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // نستخدم الرابط الكامل للسيرفر لتجنب إرسال الطلب إلى واجهة المستخدم
      const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
      
      // استخراج التوكن من المتصفح لإرساله مع الطلب عشان السيرفر يقبله
      const token = localStorage.getItem("token")?.replace(/"/g, "") || localStorage.getItem("jwt")?.replace(/"/g, "");
      const headers: HeadersInit = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(
        `${apiBase}/api/v1/upload/zip`,
        { method: "POST", headers, body: formData, credentials: "include" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Upload failed");

      setUploadedZipUrl(data.url);
      toast.success("ZIP uploaded successfully ✅");
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
      setZipFile(null);
      setUploadedZipUrl("");
    } finally {
      setIsUploading(false);
    }
  }

  // ── Image helpers ─────────────────────────────────────────────────
  function addImageField() { setImages(prev => [...prev, ""]); }
  function removeImageField(i: number) { setImages(prev => prev.filter((_, idx) => idx !== i)); }
  function updateImage(i: number, val: string) {
    setImages(prev => prev.map((v, idx) => idx === i ? val : v));
  }

  // ── Submit ────────────────────────────────────────────────────────
  function onSubmit(values: Form) {
    if (!uploadedZipUrl) {
      toast.error("Please upload the source code ZIP file first");
      return;
    }

    const techArray = values.technologies
      ? values.technologies.split(",").map(t => t.trim()).filter(Boolean)
      : [];
    const validImages = images.filter(u => u.trim().length > 0);

    const payload = {
      title: values.title,
      description: values.description,
      category: values.category,
      price: values.price,
      technologies: techArray,
      images: validImages,
      demoUrl: values.demoUrl || undefined,
      sourceCodeUrl: uploadedZipUrl,   // ← الـ Cloudinary URL
    };

    if (editId) {
      setIsUpdating(true);
      api(`/products/${editId}`, { method: "PUT", body: JSON.stringify(payload) })
        .then(() => { toast.success("Project updated successfully! 🎉"); navigate("/dashboard"); })
        .catch((e: any) => toast.error(e?.message ?? "Failed to update project"))
        .finally(() => setIsUpdating(false));
      return;
    }

    createProduct.mutate(payload as any, {
      onSuccess: (product: any) => {
        toast.success("Project listed successfully! 🎉");
        navigate(`/products/${product.slug ?? ""}`);
      },
      onError: (e: any) => toast.error(e?.message ?? "Failed to list project"),
    });
  }

  const isBusy = createProduct.isPending || isUpdating || isUploading;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Upload className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold">{editId ? "Edit Your Project" : "List Your Project"}</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Share your work with developers worldwide and earn money from your code
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Basic Info */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Project Info
          </h2>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Project Title *</label>
            <input {...register("title")}
              placeholder="e.g. React Dashboard with Dark Mode"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
            {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Description *</label>
            <textarea {...register("description")} rows={4}
              placeholder="Describe your project, what it does, what's included..."
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary resize-none" />
            {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Category *</label>
              <select {...register("category")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary">
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="mt-1 text-xs text-destructive">{errors.category.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-primary" /> Price (USD) *
              </label>
              <input {...register("price")} type="number" min="1" step="1"
                placeholder="5"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
              {errors.price && <p className="mt-1 text-xs text-destructive">{errors.price.message}</p>}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 flex items-center gap-1">
              <Tag className="h-3.5 w-3.5 text-primary" /> Technologies
            </label>
            <input {...register("technologies")}
              placeholder="React, TypeScript, Tailwind CSS (comma-separated)"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>

        {/* Media */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <ImagePlus className="h-4 w-4 text-primary" /> Media
          </h2>

          <div className="flex rounded-xl border border-border overflow-hidden">
            <button type="button"
              onClick={() => setMediaType("image")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors
                ${mediaType === "image" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}>
              <ImagePlus className="h-4 w-4" /> Images
            </button>
            <button type="button"
              onClick={() => setMediaType("video")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors
                ${mediaType === "video" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`}>
              <Video className="h-4 w-4" /> Video
            </button>
          </div>

          {mediaType === "image" ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Paste image URLs (screenshots of your project)</p>
              {images.map((url, i) => (
                <div key={i} className="flex gap-2">
                  <input value={url} onChange={e => updateImage(i, e.target.value)}
                    placeholder={`Image URL ${i + 1}`}
                    className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
                  {images.length > 1 && (
                    <button type="button" onClick={() => removeImageField(i)}
                      className="rounded-xl border border-border p-2.5 hover:bg-muted text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {images.length < 5 && (
                <button type="button" onClick={addImageField} className="text-sm text-primary hover:underline">
                  + Add another image
                </button>
              )}
            </div>
          ) : (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Paste a YouTube or demo video URL</p>
              <input
                placeholder="https://youtube.com/watch?v=..."
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                onChange={e => setImages([e.target.value])}
              />
            </div>
          )}
        </div>

        {/* Source Code ZIP Upload */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" /> Source Code *
          </h2>

          {/* ZIP uploader */}
          <div>
            <p className="text-xs text-muted-foreground mb-3">
              Upload your project as a <strong>.zip</strong> file. Buyers will be able to download it directly after purchase.
            </p>

            {/* Drop zone */}
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer
                ${uploadedZipUrl
                  ? "border-primary/50 bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
                }
                ${isUploading ? "pointer-events-none opacity-70" : ""}`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-sm font-medium">Uploading {zipFile?.name}...</p>
                  <p className="text-xs text-muted-foreground">Please wait</p>
                </>
              ) : uploadedZipUrl ? (
                <>
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                  <p className="text-sm font-medium text-primary">
                    {zipFile?.name ?? "ZIP uploaded"}
                  </p>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setZipFile(null); setUploadedZipUrl(""); }}
                    className="text-xs text-destructive hover:underline"
                  >
                    Remove and upload a different file
                  </button>
                </>
              ) : (
                <>
                  <FileArchive className="h-8 w-8 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Click to select a ZIP file</p>
                    <p className="text-xs text-muted-foreground mt-1">Max size: 200 MB</p>
                  </div>
                </>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,application/zip"
              className="hidden"
              onChange={handleZipSelect}
            />
          </div>

          {/* Demo URL */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">Live Demo URL</label>
            <input {...register("demoUrl")}
              placeholder="https://your-demo.vercel.app (optional)"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary" />
            {errors.demoUrl && <p className="mt-1 text-xs text-destructive">{errors.demoUrl.message}</p>}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isBusy || !uploadedZipUrl}
          className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
        >
          {isBusy ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> {isUploading ? "Uploading ZIP..." : "Publishing..."}</>
          ) : (
            <><Upload className="h-4 w-4" /> {editId ? "Save Changes" : "Publish Project"}</>
          )}
        </button>
      </form>
    </div>
  );
}

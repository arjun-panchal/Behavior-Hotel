import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const CATEGORIES = ['Drafts', 'Sent', 'Exports'] as const;
type Category = (typeof CATEGORIES)[number];

const storageRoot = path.join(process.cwd(), 'storage');

function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

function safeName(name: string): string {
  const base = path
    .basename(String(name || ''))
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_')
    .replace(/\.+$/, '')
    .trim();
  return base.slice(0, 180) || 'file';
}

async function ensureDir(category: Category): Promise<string> {
  const dir = path.join(storageRoot, category);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requested = searchParams.get('category') || '';
    const filenameParam = searchParams.get('filename') || '';
    if (requested && !isCategory(requested)) {
      return NextResponse.json({ success: false, message: 'Invalid category' }, { status: 400 });
    }
    if (filenameParam) {
      if (!isCategory(requested)) {
        return NextResponse.json({ success: false, message: 'Invalid category' }, { status: 400 });
      }
      const filename = safeName(filenameParam);
      const target = path.join(storageRoot, requested, filename);
      try {
        const data = await fs.readFile(target);
        const lower = filename.toLowerCase();
        const contentType = lower.endsWith('.pdf')
          ? 'application/pdf'
          : lower.endsWith('.json')
            ? 'application/json; charset=utf-8'
            : 'application/octet-stream';
        return new NextResponse(new Uint8Array(data), {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `inline; filename="${filename}"`,
            'Cache-Control': 'no-store'
          }
        });
      } catch {
        return NextResponse.json({ success: false, message: 'File not found' }, { status: 404 });
      }
    }
    const targets: Category[] = isCategory(requested) ? [requested] : [...CATEGORIES];
    const folders: Record<string, string[]> = {};
    for (const category of targets) {
      const dir = await ensureDir(category);
      try {
        folders[category] = (await fs.readdir(dir)).filter((f) => !f.startsWith('.'));
      } catch {
        folders[category] = [];
      }
    }
    const root = path.relative(process.cwd(), storageRoot).split(path.sep).join('/');
    return NextResponse.json({ success: true, root, folders });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to list files' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const category = String(body.category || '');
    if (!isCategory(category)) {
      return NextResponse.json({ success: false, message: 'Invalid category' }, { status: 400 });
    }
    const filename = safeName(body.filename);
    const dir = await ensureDir(category);
    const target = path.join(dir, filename);
    const content = body.base64 ? Buffer.from(String(body.content ?? ''), 'base64') : String(body.content ?? '');
    await fs.writeFile(target, content);
    const relative = path.relative(process.cwd(), target).split(path.sep).join('/');
    return NextResponse.json({ success: true, path: relative, folder: category, filename });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to save file' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    if (!isCategory(category)) {
      return NextResponse.json({ success: false, message: 'Invalid category' }, { status: 400 });
    }
    const filename = safeName(searchParams.get('filename') || '');
    const target = path.join(storageRoot, category, filename);
    await fs.rm(target, { force: true });
    return NextResponse.json({ success: true, folder: category, filename });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete file' }, { status: 500 });
  }
}

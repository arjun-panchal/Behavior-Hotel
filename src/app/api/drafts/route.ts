import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const draftsFilePath = path.join(process.cwd(), 'drafts.json');

// Initialize drafts file if it doesn't exist
async function initDraftsFile() {
  try {
    await fs.access(draftsFilePath);
  } catch {
    await fs.writeFile(draftsFilePath, JSON.stringify([]));
  }
}

export async function GET() {
  await initDraftsFile();
  try {
    const data = await fs.readFile(draftsFilePath, 'utf8');
    const drafts = JSON.parse(data);
    return NextResponse.json({ success: true, drafts });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to read drafts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await initDraftsFile();
  try {
    const newDraft = await request.json();
    const data = await fs.readFile(draftsFilePath, 'utf8');
    let drafts: any[] = JSON.parse(data);
    
    const existingIndex = drafts.findIndex(d => d.id === newDraft.id);
    if (existingIndex >= 0) {
      drafts[existingIndex] = newDraft;
    } else {
      drafts.push(newDraft);
    }
    
    await fs.writeFile(draftsFilePath, JSON.stringify(drafts, null, 2));
    return NextResponse.json({ success: true, drafts });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to save draft' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  await initDraftsFile();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, message: 'Draft ID is required' }, { status: 400 });
    }
    
    const data = await fs.readFile(draftsFilePath, 'utf8');
    let drafts: any[] = JSON.parse(data);
    drafts = drafts.filter(d => d.id !== id);
    
    await fs.writeFile(draftsFilePath, JSON.stringify(drafts, null, 2));
    return NextResponse.json({ success: true, drafts });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete draft' }, { status: 500 });
  }
}

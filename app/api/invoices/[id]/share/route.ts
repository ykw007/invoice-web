import { fail } from "@/lib/api/response";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  return fail("구현 예정", 501);
}

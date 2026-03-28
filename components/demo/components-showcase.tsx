"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SectionHeading } from "@/components/common/section-heading";
import { AlertCircle, ChevronDown } from "lucide-react";

/** shadcn/ui 컴포넌트 쇼케이스 */
export function ComponentsShowcase() {
  const [progress] = useState(60);

  return (
    <section id="components" className="container mx-auto px-4 py-16 space-y-8">
      <SectionHeading
        title="컴포넌트 쇼케이스"
        description="포함된 shadcn/ui 컴포넌트를 확인해보세요."
      />

      <Tabs defaultValue="buttons">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="buttons">버튼</TabsTrigger>
          <TabsTrigger value="forms">폼</TabsTrigger>
          <TabsTrigger value="feedback">피드백</TabsTrigger>
          <TabsTrigger value="overlays">오버레이</TabsTrigger>
        </TabsList>

        {/* 버튼 탭 */}
        <TabsContent value="buttons" className="space-y-6 pt-4">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Variants</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Sizes</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">🔍</Button>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">States</p>
            <div className="flex flex-wrap gap-2">
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </TabsContent>

        {/* 폼 탭 */}
        <TabsContent value="forms" className="space-y-6 pt-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="showcase-input">Input</Label>
            <Input id="showcase-input" placeholder="텍스트를 입력하세요" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="showcase-textarea">Textarea</Label>
            <Textarea
              id="showcase-textarea"
              placeholder="여러 줄 텍스트를 입력하세요"
              rows={3}
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch id="showcase-switch" />
            <Label htmlFor="showcase-switch">알림 받기</Label>
          </div>
        </TabsContent>

        {/* 피드백 탭 */}
        <TabsContent value="feedback" className="space-y-6 pt-4">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Badge</p>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Alert</p>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>알림</AlertTitle>
              <AlertDescription>
                이것은 기본 알림 메시지입니다.
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>오류</AlertTitle>
              <AlertDescription>
                이것은 오류 알림 메시지입니다.
              </AlertDescription>
            </Alert>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Skeleton</p>
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Progress ({progress}%)
            </p>
            <Progress value={progress} />
          </div>
        </TabsContent>

        {/* 오버레이 탭 */}
        <TabsContent value="overlays" className="space-y-4 pt-4">
          <div className="flex flex-wrap gap-3">
            {/* Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Dialog 열기</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>다이얼로그 제목</DialogTitle>
                  <DialogDescription>
                    이것은 다이얼로그 설명입니다. 확인 또는 취소 버튼으로 닫을 수 있습니다.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline">취소</Button>
                  <Button>확인</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Sheet 열기</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Sheet 제목</SheetTitle>
                  <SheetDescription>
                    우측에서 슬라이드되는 패널입니다.
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>

            {/* Tooltip */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline">Tooltip 호버</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>툴팁 메시지입니다</p>
              </TooltipContent>
            </Tooltip>

            {/* Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Dropdown <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>메뉴 항목 1</DropdownMenuItem>
                <DropdownMenuItem>메뉴 항목 2</DropdownMenuItem>
                <DropdownMenuItem>메뉴 항목 3</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

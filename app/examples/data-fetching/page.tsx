"use client";

import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Container } from "@/components/layout/container";
import { PageHeader } from "@/components/layout/page-header";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ErrorState } from "@/components/common/error-state";
import { DataTable } from "@/components/common/data-table";
import { CodeBlock } from "@/components/common/code-block";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TableColumn } from "@/types";
import { RefreshCw } from "lucide-react";

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
}

async function fetchPosts(): Promise<Post[]> {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=10");
  if (!res.ok) throw new Error("포스트 데이터를 불러오지 못했습니다.");
  return res.json() as Promise<Post[]>;
}

async function fetchUsers(): Promise<User[]> {
  const res = await fetch("https://jsonplaceholder.typicode.com/users");
  if (!res.ok) throw new Error("사용자 데이터를 불러오지 못했습니다.");
  return res.json() as Promise<User[]>;
}

const postColumns: TableColumn<Post>[] = [
  { key: "id", header: "ID", sortable: true },
  { key: "userId", header: "유저ID", sortable: true },
  {
    key: "title",
    header: "제목",
    sortable: true,
    render: (value) => (
      <span className="line-clamp-1 max-w-xs text-sm">{String(value)}</span>
    ),
  },
];

const userColumns: TableColumn<User>[] = [
  { key: "id", header: "ID", sortable: true },
  { key: "name", header: "이름", sortable: true },
  { key: "email", header: "이메일", sortable: true },
  { key: "phone", header: "전화번호" },
];

function PostsTable() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Posts 목록</CardTitle>
              <Badge variant="secondary">useQuery</Badge>
              {isFetching && <LoadingSpinner size="sm" />}
            </div>
            <CardDescription>JSONPlaceholder API — 최근 10개 포스트</CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            새로고침
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : isError ? (
          <ErrorState
            title="데이터 로드 실패"
            message={error instanceof Error ? error.message : "알 수 없는 오류"}
            onRetry={() => refetch()}
          />
        ) : (
          <DataTable columns={postColumns} data={data ?? []} keyField="id" />
        )}
      </CardContent>
    </Card>
  );
}

function UsersTable() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Users 목록</CardTitle>
              <Badge variant="secondary">useQuery</Badge>
              {isFetching && <LoadingSpinner size="sm" />}
            </div>
            <CardDescription>JSONPlaceholder API — 전체 사용자</CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            새로고침
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : isError ? (
          <ErrorState
            title="데이터 로드 실패"
            message={error instanceof Error ? error.message : "알 수 없는 오류"}
            onRetry={() => refetch()}
          />
        ) : (
          <DataTable columns={userColumns} data={data ?? []} keyField="id" />
        )}
      </CardContent>
    </Card>
  );
}

export default function DataFetchingExamplePage() {
  return (
    <MainLayout>
      <Container as="main" className="py-12">
        <PageHeader
          title="데이터 페칭"
          description="TanStack Query(React Query)를 사용한 서버 데이터 관리 예제입니다."
        />

        <div className="space-y-8">
          <PostsTable />
          <UsersTable />

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">코드 예제</h2>
            <CodeBlock
              language="tsx"
              code={`import { useQuery } from "@tanstack/react-query";

async function fetchPosts() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  if (!res.ok) throw new Error("데이터를 불러오지 못했습니다.");
  return res.json();
}

function PostsList() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return <DataTable columns={columns} data={data} />;
}`}
            />
          </section>
        </div>
      </Container>
    </MainLayout>
  );
}

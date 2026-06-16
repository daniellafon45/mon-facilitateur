export type DocView =
  | "tous"
  | "projets"
  | "reunions"
  | "partages"
  | "favoris"
  | "recents"
  | "corbeille";

export type DocSort = "recent" | "name" | "size" | "type" | "old";

export type DocSource = "manuel" | "import" | "séance" | "compte rendu";

export interface DocItem {
  id: string;
  name: string;
  type: string;
  projectId: string | null;
  meetingId: string | null;
  owner: string;
  ts: number;
  size: number;
  fav: boolean;
  shared: boolean;
  sharedWith: string[];
  source: DocSource | string;
  trashed: boolean;
  deletedTs?: number;
}

export interface DocFilters {
  type: string;
  owner: string;
  project: string;
  mine: boolean;
  favOnly: boolean;
  period: string;
}

export type DocModalState =
  | { type: "upload" }
  | { type: "share"; doc: DocItem }
  | { type: "rename"; doc: DocItem }
  | { type: "move"; docs: DocItem[] }
  | {
      type: "confirm";
      title: string;
      body: string;
      confirmLabel: string;
      danger?: boolean;
      onConfirm: () => void;
    }
  | null;

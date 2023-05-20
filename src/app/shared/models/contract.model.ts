export interface Contract {
    id: number;
    name: string;
    reviewed: boolean;
    uploadTime: string;
    paid?: boolean;
    paidTime?: string;
    referralCode?: string;
    isRelevant?: boolean;
    todos?: Set<string>;
    todosDone?: Set<string>;
}

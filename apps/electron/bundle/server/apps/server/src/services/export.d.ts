export declare class ExportService {
    createJob(sessionId: string, format: string): Promise<{
        id: string;
        status: "queued";
    }>;
    private processJob;
}
export declare const exportService: ExportService;

export declare class EmailExportService {
    send(sessionId: string, to: string, format: string, filePath: string): Promise<{
        id: string;
        status: string;
    }>;
}
export declare const emailExportService: EmailExportService;

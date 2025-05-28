export interface IFileSystem {
    readFile(filePath: string): Promise<string>;
    writeFile(filePath: string, content: string): Promise<void>;
    exists(filePath: string): Promise<boolean>;
    mkdir(dirPath: string, options?: {
        recursive?: boolean;
    }): Promise<void>;
    readdir(dirPath: string): Promise<string[]>;
    rm(filePath: string, options?: {
        recursive?: boolean;
        force?: boolean;
    }): Promise<void>;
    stat(filePath: string): Promise<{
        isDirectory(): boolean;
        isFile(): boolean;
    }>;
}
export interface MockFile {
    content: string;
    createdAt: Date;
    modifiedAt: Date;
}
export declare class MockFileSystem implements IFileSystem {
    private files;
    private directories;
    constructor();
    readFile(filePath: string): Promise<string>;
    writeFile(filePath: string, content: string): Promise<void>;
    exists(filePath: string): Promise<boolean>;
    mkdir(dirPath: string, options?: {
        recursive?: boolean;
    }): Promise<void>;
    readdir(dirPath: string): Promise<string[]>;
    rm(filePath: string, options?: {
        recursive?: boolean;
        force?: boolean;
    }): Promise<void>;
    stat(filePath: string): Promise<{
        isDirectory(): boolean;
        isFile(): boolean;
    }>;
    seed(files: Record<string, string>): void;
    clear(): void;
    getFiles(): string[];
    getDirectories(): string[];
    private normalizePath;
}
//# sourceMappingURL=MockFileSystem.d.ts.map
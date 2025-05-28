import { EventAwareInterfaceMock } from '../base/EventAwareMock.js';
import type { IFileSystem } from './MockFileSystem.js';
export declare class EventAwareMockFileSystem extends EventAwareInterfaceMock<IFileSystem> implements IFileSystem {
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
    seedFiles(files: Record<string, string>): Promise<void>;
    clear(): Promise<void>;
    getStats(): {
        fileCount: number;
        directoryCount: number;
        totalSize: number;
        paths: {
            files: string[];
            directories: string[];
        };
    };
    private normalizePath;
}
//# sourceMappingURL=EventAwareMockFileSystem.d.ts.map
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { injectable } from 'inversify';
import * as path from 'path';
import { EventAwareInterfaceMock } from '../base/EventAwareMock.js';
let EventAwareMockFileSystem = class EventAwareMockFileSystem extends EventAwareInterfaceMock {
    files = new Map();
    directories = new Set();
    constructor() {
        super('MockFileSystem');
        this.directories.add('/');
    }
    async readFile(filePath) {
        const normalizedPath = this.normalizePath(filePath);
        await this.emitOperationStarted('readFile', {
            path: normalizedPath,
            exists: this.files.has(normalizedPath)
        });
        try {
            const file = this.files.get(normalizedPath);
            if (!file) {
                const error = new Error(`ENOENT: no such file or directory, open '${filePath}'`);
                await this.emitOperationFailed('readFile', error, { path: normalizedPath });
                throw error;
            }
            await this.emitOperationCompleted('readFile', {
                path: normalizedPath,
                size: file.content.length,
                createdAt: file.createdAt,
                modifiedAt: file.modifiedAt
            }, file.content);
            return file.content;
        }
        catch (error) {
            if (error instanceof Error && !error.message.includes('ENOENT')) {
                await this.emitOperationFailed('readFile', error, { path: normalizedPath });
            }
            throw error;
        }
    }
    async writeFile(filePath, content) {
        const normalizedPath = this.normalizePath(filePath);
        const parentDir = path.dirname(normalizedPath);
        const isNewFile = !this.files.has(normalizedPath);
        await this.emitOperationStarted('writeFile', {
            path: normalizedPath,
            size: content.length,
            isNewFile,
            parentDir
        });
        try {
            if (!this.directories.has(parentDir)) {
                await this.mkdir(parentDir, { recursive: true });
            }
            const now = new Date();
            const existingFile = this.files.get(normalizedPath);
            this.files.set(normalizedPath, {
                content,
                createdAt: existingFile?.createdAt || now,
                modifiedAt: now
            });
            await this.emitOperationCompleted('writeFile', {
                path: normalizedPath,
                size: content.length,
                isNewFile,
                parentDir,
                previousSize: existingFile?.content.length
            });
            if (isNewFile) {
                await this.emitMockEvent('file.created', {
                    path: normalizedPath,
                    size: content.length
                });
            }
            else {
                await this.emitMockEvent('file.updated', {
                    path: normalizedPath,
                    newSize: content.length,
                    previousSize: existingFile?.content.length
                });
            }
        }
        catch (error) {
            await this.emitOperationFailed('writeFile', error, {
                path: normalizedPath,
                size: content.length
            });
            throw error;
        }
    }
    async exists(filePath) {
        const normalizedPath = this.normalizePath(filePath);
        await this.emitOperationStarted('exists', { path: normalizedPath });
        try {
            const exists = this.files.has(normalizedPath) || this.directories.has(normalizedPath);
            await this.emitOperationCompleted('exists', {
                path: normalizedPath,
                exists,
                type: this.files.has(normalizedPath) ? 'file' :
                    this.directories.has(normalizedPath) ? 'directory' : 'none'
            }, exists);
            return exists;
        }
        catch (error) {
            await this.emitOperationFailed('exists', error, { path: normalizedPath });
            throw error;
        }
    }
    async mkdir(dirPath, options) {
        const normalizedPath = this.normalizePath(dirPath);
        const isRecursive = options?.recursive ?? false;
        await this.emitOperationStarted('mkdir', {
            path: normalizedPath,
            recursive: isRecursive,
            exists: this.directories.has(normalizedPath)
        });
        try {
            if (this.directories.has(normalizedPath)) {
                await this.emitOperationCompleted('mkdir', {
                    path: normalizedPath,
                    alreadyExists: true
                });
                return;
            }
            if (isRecursive) {
                const parts = normalizedPath.split('/').filter(Boolean);
                let currentPath = '/';
                for (const part of parts) {
                    currentPath = path.posix.join(currentPath, part);
                    if (!this.directories.has(currentPath)) {
                        this.directories.add(currentPath);
                        await this.emitMockEvent('directory.created', {
                            path: currentPath,
                            isRecursive: true
                        });
                    }
                }
            }
            else {
                const parentDir = path.dirname(normalizedPath);
                if (parentDir !== normalizedPath && !this.directories.has(parentDir)) {
                    const error = new Error(`ENOENT: no such file or directory, mkdir '${dirPath}'`);
                    await this.emitOperationFailed('mkdir', error, { path: normalizedPath });
                    throw error;
                }
                this.directories.add(normalizedPath);
                await this.emitMockEvent('directory.created', {
                    path: normalizedPath,
                    isRecursive: false
                });
            }
            await this.emitOperationCompleted('mkdir', {
                path: normalizedPath,
                recursive: isRecursive,
                created: true
            });
        }
        catch (error) {
            if (error instanceof Error && !error.message.includes('ENOENT')) {
                await this.emitOperationFailed('mkdir', error, { path: normalizedPath });
            }
            throw error;
        }
    }
    async readdir(dirPath) {
        const normalizedPath = this.normalizePath(dirPath);
        await this.emitOperationStarted('readdir', {
            path: normalizedPath,
            exists: this.directories.has(normalizedPath)
        });
        try {
            if (!this.directories.has(normalizedPath)) {
                const error = new Error(`ENOENT: no such file or directory, scandir '${dirPath}'`);
                await this.emitOperationFailed('readdir', error, { path: normalizedPath });
                throw error;
            }
            const entries = [];
            for (const filePath of this.files.keys()) {
                if (path.dirname(filePath) === normalizedPath) {
                    entries.push(path.basename(filePath));
                }
            }
            for (const dirPath of this.directories) {
                if (path.dirname(dirPath) === normalizedPath && dirPath !== normalizedPath) {
                    entries.push(path.basename(dirPath));
                }
            }
            await this.emitOperationCompleted('readdir', {
                path: normalizedPath,
                entryCount: entries.length,
                hasFiles: entries.some(entry => {
                    const fullPath = path.posix.join(normalizedPath, entry);
                    return this.files.has(fullPath);
                }),
                hasDirectories: entries.some(entry => {
                    const fullPath = path.posix.join(normalizedPath, entry);
                    return this.directories.has(fullPath);
                })
            }, entries);
            return entries;
        }
        catch (error) {
            if (error instanceof Error && !error.message.includes('ENOENT')) {
                await this.emitOperationFailed('readdir', error, { path: normalizedPath });
            }
            throw error;
        }
    }
    async rm(filePath, options) {
        const normalizedPath = this.normalizePath(filePath);
        const isRecursive = options?.recursive ?? false;
        const isForce = options?.force ?? false;
        await this.emitOperationStarted('rm', {
            path: normalizedPath,
            recursive: isRecursive,
            force: isForce,
            exists: this.files.has(normalizedPath) || this.directories.has(normalizedPath)
        });
        try {
            const isFile = this.files.has(normalizedPath);
            const isDirectory = this.directories.has(normalizedPath);
            if (!isFile && !isDirectory) {
                if (!isForce) {
                    const error = new Error(`ENOENT: no such file or directory, unlink '${filePath}'`);
                    await this.emitOperationFailed('rm', error, { path: normalizedPath });
                    throw error;
                }
                await this.emitOperationCompleted('rm', {
                    path: normalizedPath,
                    skipped: true,
                    reason: 'not-found-but-forced'
                });
                return;
            }
            if (isFile) {
                this.files.delete(normalizedPath);
                await this.emitMockEvent('file.deleted', {
                    path: normalizedPath
                });
            }
            else if (isDirectory) {
                if (isRecursive) {
                    const toRemove = Array.from(this.files.keys())
                        .filter(fp => fp.startsWith(normalizedPath + '/'));
                    toRemove.forEach(fp => this.files.delete(fp));
                    const dirsToRemove = Array.from(this.directories)
                        .filter(dp => dp.startsWith(normalizedPath + '/'))
                        .sort((a, b) => b.length - a.length);
                    dirsToRemove.forEach(dp => this.directories.delete(dp));
                    this.directories.delete(normalizedPath);
                    await this.emitMockEvent('directory.deleted', {
                        path: normalizedPath,
                        recursive: true,
                        filesRemoved: toRemove.length,
                        dirsRemoved: dirsToRemove.length + 1
                    });
                }
                else {
                    const hasFiles = Array.from(this.files.keys())
                        .some(fp => path.dirname(fp) === normalizedPath);
                    const hasSubdirs = Array.from(this.directories)
                        .some(dp => path.dirname(dp) === normalizedPath && dp !== normalizedPath);
                    if (hasFiles || hasSubdirs) {
                        const error = new Error(`ENOTEMPTY: directory not empty, rmdir '${filePath}'`);
                        await this.emitOperationFailed('rm', error, { path: normalizedPath });
                        throw error;
                    }
                    this.directories.delete(normalizedPath);
                    await this.emitMockEvent('directory.deleted', {
                        path: normalizedPath,
                        recursive: false
                    });
                }
            }
            await this.emitOperationCompleted('rm', {
                path: normalizedPath,
                type: isFile ? 'file' : 'directory',
                recursive: isRecursive,
                force: isForce
            });
        }
        catch (error) {
            if (error instanceof Error && !error.message.includes('ENOENT') && !error.message.includes('ENOTEMPTY')) {
                await this.emitOperationFailed('rm', error, { path: normalizedPath });
            }
            throw error;
        }
    }
    async stat(filePath) {
        const normalizedPath = this.normalizePath(filePath);
        await this.emitOperationStarted('stat', { path: normalizedPath });
        try {
            const isFile = this.files.has(normalizedPath);
            const isDirectory = this.directories.has(normalizedPath);
            if (!isFile && !isDirectory) {
                const error = new Error(`ENOENT: no such file or directory, stat '${filePath}'`);
                await this.emitOperationFailed('stat', error, { path: normalizedPath });
                throw error;
            }
            const stat = {
                isDirectory: () => isDirectory,
                isFile: () => isFile
            };
            await this.emitOperationCompleted('stat', {
                path: normalizedPath,
                isFile,
                isDirectory
            }, stat);
            return stat;
        }
        catch (error) {
            if (error instanceof Error && !error.message.includes('ENOENT')) {
                await this.emitOperationFailed('stat', error, { path: normalizedPath });
            }
            throw error;
        }
    }
    async seedFiles(files) {
        await this.emitOperationStarted('seedFiles', {
            fileCount: Object.keys(files).length,
            paths: Object.keys(files)
        });
        try {
            const seededFiles = [];
            for (const [filePath, content] of Object.entries(files)) {
                await this.writeFile(filePath, content);
                seededFiles.push(filePath);
            }
            await this.emitOperationCompleted('seedFiles', {
                seededCount: seededFiles.length,
                seededPaths: seededFiles
            });
        }
        catch (error) {
            await this.emitOperationFailed('seedFiles', error, {
                attemptedCount: Object.keys(files).length
            });
            throw error;
        }
    }
    async clear() {
        const fileCount = this.files.size;
        const dirCount = this.directories.size - 1;
        await this.emitOperationStarted('clear', {
            fileCount,
            dirCount
        });
        this.files.clear();
        this.directories.clear();
        this.directories.add('/');
        await this.emitOperationCompleted('clear', {
            clearedFiles: fileCount,
            clearedDirectories: dirCount
        });
    }
    getStats() {
        return {
            fileCount: this.files.size,
            directoryCount: this.directories.size,
            totalSize: Array.from(this.files.values())
                .reduce((total, file) => total + file.content.length, 0),
            paths: {
                files: Array.from(this.files.keys()),
                directories: Array.from(this.directories)
            }
        };
    }
    normalizePath(filePath) {
        return path.posix.normalize(filePath.startsWith('/') ? filePath : `/${filePath}`);
    }
};
EventAwareMockFileSystem = __decorate([
    injectable(),
    __metadata("design:paramtypes", [])
], EventAwareMockFileSystem);
export { EventAwareMockFileSystem };
//# sourceMappingURL=EventAwareMockFileSystem.js.map
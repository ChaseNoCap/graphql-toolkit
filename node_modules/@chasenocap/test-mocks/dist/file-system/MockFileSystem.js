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
let MockFileSystem = class MockFileSystem {
    files = new Map();
    directories = new Set();
    constructor() {
        this.directories.add('/');
    }
    async readFile(filePath) {
        const normalizedPath = this.normalizePath(filePath);
        const file = this.files.get(normalizedPath);
        if (!file) {
            throw new Error(`ENOENT: no such file or directory, open '${filePath}'`);
        }
        return file.content;
    }
    async writeFile(filePath, content) {
        const normalizedPath = this.normalizePath(filePath);
        const dir = path.dirname(normalizedPath);
        if (!this.directories.has(dir) && dir !== '.') {
            throw new Error(`ENOENT: no such file or directory, open '${filePath}'`);
        }
        this.files.set(normalizedPath, {
            content,
            createdAt: new Date(),
            modifiedAt: new Date()
        });
    }
    async exists(filePath) {
        const normalizedPath = this.normalizePath(filePath);
        return this.files.has(normalizedPath) || this.directories.has(normalizedPath);
    }
    async mkdir(dirPath, options) {
        const normalizedPath = this.normalizePath(dirPath);
        if (options?.recursive) {
            const parts = normalizedPath.split('/').filter(Boolean);
            let currentPath = '';
            for (const part of parts) {
                currentPath += '/' + part;
                this.directories.add(currentPath);
            }
        }
        else {
            const parentDir = path.dirname(normalizedPath);
            if (parentDir !== '.' && !this.directories.has(parentDir)) {
                throw new Error(`ENOENT: no such file or directory, mkdir '${dirPath}'`);
            }
            this.directories.add(normalizedPath);
        }
    }
    async readdir(dirPath) {
        const normalizedPath = this.normalizePath(dirPath);
        if (!this.directories.has(normalizedPath)) {
            throw new Error(`ENOENT: no such file or directory, scandir '${dirPath}'`);
        }
        const entries = [];
        const dirPrefix = normalizedPath.endsWith('/') ? normalizedPath : normalizedPath + '/';
        for (const filePath of this.files.keys()) {
            if (filePath.startsWith(dirPrefix)) {
                const relative = filePath.slice(dirPrefix.length);
                if (!relative.includes('/')) {
                    entries.push(relative);
                }
            }
        }
        for (const dir of this.directories) {
            if (dir.startsWith(dirPrefix) && dir !== normalizedPath) {
                const relative = dir.slice(dirPrefix.length);
                if (!relative.includes('/')) {
                    entries.push(relative);
                }
            }
        }
        return entries.sort();
    }
    async rm(filePath, options) {
        const normalizedPath = this.normalizePath(filePath);
        if (this.files.has(normalizedPath)) {
            this.files.delete(normalizedPath);
        }
        else if (this.directories.has(normalizedPath)) {
            if (options?.recursive) {
                const dirPrefix = normalizedPath.endsWith('/') ? normalizedPath : normalizedPath + '/';
                for (const file of this.files.keys()) {
                    if (file.startsWith(dirPrefix)) {
                        this.files.delete(file);
                    }
                }
                for (const dir of this.directories) {
                    if (dir.startsWith(dirPrefix) || dir === normalizedPath) {
                        this.directories.delete(dir);
                    }
                }
            }
            else {
                const contents = await this.readdir(normalizedPath);
                if (contents.length > 0) {
                    throw new Error(`ENOTEMPTY: directory not empty, rmdir '${filePath}'`);
                }
                this.directories.delete(normalizedPath);
            }
        }
        else if (!options?.force) {
            throw new Error(`ENOENT: no such file or directory, unlink '${filePath}'`);
        }
    }
    async stat(filePath) {
        const normalizedPath = this.normalizePath(filePath);
        if (this.files.has(normalizedPath)) {
            return {
                isDirectory: () => false,
                isFile: () => true
            };
        }
        else if (this.directories.has(normalizedPath)) {
            return {
                isDirectory: () => true,
                isFile: () => false
            };
        }
        else {
            throw new Error(`ENOENT: no such file or directory, stat '${filePath}'`);
        }
    }
    seed(files) {
        for (const [filePath, content] of Object.entries(files)) {
            const normalizedPath = this.normalizePath(filePath);
            const dir = path.dirname(normalizedPath);
            if (dir !== '.') {
                const parts = dir.split('/').filter(Boolean);
                let currentPath = '';
                for (const part of parts) {
                    currentPath += '/' + part;
                    this.directories.add(currentPath);
                }
            }
            this.files.set(normalizedPath, {
                content,
                createdAt: new Date(),
                modifiedAt: new Date()
            });
        }
    }
    clear() {
        this.files.clear();
        this.directories.clear();
        this.directories.add('/');
    }
    getFiles() {
        return Array.from(this.files.keys()).sort();
    }
    getDirectories() {
        return Array.from(this.directories).sort();
    }
    normalizePath(filePath) {
        const normalized = filePath.replace(/\\/g, '/');
        return normalized.startsWith('/') ? normalized : '/' + normalized;
    }
};
MockFileSystem = __decorate([
    injectable(),
    __metadata("design:paramtypes", [])
], MockFileSystem);
export { MockFileSystem };
//# sourceMappingURL=MockFileSystem.js.map
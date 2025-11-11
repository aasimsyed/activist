// SPDX-License-Identifier: AGPL-3.0-or-later
// MARK: Imports
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type { ContentImage, FileUploadMix } from "../../app/types/content/file";

// MARK: Helpers & global state

let originalUseAuth: typeof globalThis.useAuth;
let originalFetch: typeof globalThis.fetch;
let originalCreateObjectURL: typeof URL.createObjectURL | undefined;

const mockFetch = vi.fn();
const BLACK = { preference: "dark" as const, value: "dark" as const };
const WHITE = { preference: "light" as const, value: "light" as const };

async function instantiateFileManager() {
  const module = await import("../../app/composables/useFileManager");
  return module.useFileManager();
}

async function loadFileTypes() {
  return await import("../../app/types/content/file");
}

async function loadImageConstants() {
  return await import("../../app/utils/imageURLRegistry.s");
}

async function loadBaseUrls() {
  return await import("../../app/utils/baseURLs");
}

function createFile(
  name: string,
  type: string,
  options: { size?: number; lastModified?: number } = {}
) {
  const size = options.size ?? name.length;
  const lastModified = options.lastModified ?? Date.now();
  return new File(["x".repeat(size)], name, { type, lastModified });
}

beforeAll(() => {
  originalUseAuth = globalThis.useAuth;
  originalFetch = globalThis.fetch;
  originalCreateObjectURL = globalThis.URL?.createObjectURL;
});

beforeEach(() => {
  vi.resetModules();

  globalThis.fetch = mockFetch.mockResolvedValue({ ok: true });
  globalThis.useAuth = () => ({
    token: { value: "Bearer test-token" },
  });

  globalThis.URL.createObjectURL = vi.fn(() => "blob://mock-url");

  if (globalThis.useColorModeMock) {
    globalThis.useColorModeMock.mockReset();
    globalThis.useColorModeMock.mockReturnValue(BLACK);
  }
});

afterEach(() => {
  mockFetch.mockReset();

  if (originalFetch) {
    globalThis.fetch = originalFetch;
  }

  globalThis.useAuth = originalUseAuth;

  if (originalCreateObjectURL) {
    globalThis.URL.createObjectURL = originalCreateObjectURL;
  }

  if (globalThis.useColorModeMock) {
    globalThis.useColorModeMock.mockReset();
    globalThis.useColorModeMock.mockReturnValue(BLACK);
  }
});

afterAll(() => {
  globalThis.useAuth = originalUseAuth;

  if (originalFetch) {
    globalThis.fetch = originalFetch;
  }

  if (originalCreateObjectURL) {
    globalThis.URL.createObjectURL = originalCreateObjectURL;
  }
});

describe("useFileManager", () => {
  // MARK: Reactive state
  it("exposes a toggleable uploadError ref defaulting to false", async () => {
    const manager = await instantiateFileManager();
    expect(manager.uploadError.value).toBe(false);
  });

  // MARK: defaultImageUrls
  it("builds default image URLs using the dark color theme", async () => {
    const manager = await instantiateFileManager();
    const {
      GET_ACTIVE_IMAGE_URL,
      GET_ORGANIZED_IMAGE_URL,
      GROW_ORGANIZATION_IMAGE_URL,
    } = await loadImageConstants();

    expect(manager.defaultImageUrls.value).toEqual([
      `${GET_ACTIVE_IMAGE_URL}_dark.png`,
      `${GET_ORGANIZED_IMAGE_URL}_dark.png`,
      `${GROW_ORGANIZATION_IMAGE_URL}_dark.png`,
    ]);
  });

  it("switches default image URLs to light assets when color scheme is light", async () => {
    globalThis.useColorModeMock?.mockReturnValueOnce(WHITE);

    const manager = await instantiateFileManager();
    const {
      GET_ACTIVE_IMAGE_URL,
      GET_ORGANIZED_IMAGE_URL,
      GROW_ORGANIZATION_IMAGE_URL,
    } = await loadImageConstants();

    expect(manager.defaultImageUrls.value).toEqual([
      `${GET_ACTIVE_IMAGE_URL}_light.png`,
      `${GET_ORGANIZED_IMAGE_URL}_light.png`,
      `${GROW_ORGANIZATION_IMAGE_URL}_light.png`,
    ]);
  });

  // MARK: getIconImage
  it("wraps the first file as an UploadableFile instance", async () => {
    const manager = await instantiateFileManager();
    const file = createFile("logo.png", "image/png", { lastModified: 111 });
    const { UploadableFile } = await loadFileTypes();

    const result = manager.getIconImage([file]);

    expect(result).toBeInstanceOf(UploadableFile);
    expect(result).toMatchObject({
      file,
      name: "logo.png",
    });
  });

  it("returns an Error when getIconImage receives no files", async () => {
    const manager = await instantiateFileManager();

    const result = manager.getIconImage([]);

    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toBe("No file provided to upload.");
  });

  // MARK: handleAddFiles
  it("filters invalid file types and duplicates when adding files", async () => {
    const manager = await instantiateFileManager();
    const { UploadableFile } = await loadFileTypes();

    const duplicateFile = createFile("duplicate.png", "image/png", {
      size: 2,
      lastModified: 123,
    });
    const existingEntry: FileUploadMix = {
      type: "upload",
      data: new UploadableFile(duplicateFile),
      sequence: 0,
    };

    const validFile = createFile("poster.png", "image/png", {
      size: 4,
      lastModified: 999,
    });
    const invalidFile = createFile("ignored.gif", "image/gif");

    const updated = manager.handleAddFiles(
      [duplicateFile, validFile, invalidFile],
      [existingEntry]
    );

    expect(updated).toHaveLength(2);
    const [, newlyAdded] = updated;
    expect(newlyAdded.type).toBe("upload");
    expect(newlyAdded.data).toBeInstanceOf(UploadableFile);
    expect(newlyAdded.sequence).toBe(2);
    if (newlyAdded.data instanceof UploadableFile) {
      expect(newlyAdded.data.name).toBe("poster.png");
    } else {
      throw new Error("Expected UploadableFile instance");
    }
  });

  it("returns the original array when no valid files are provided", async () => {
    const manager = await instantiateFileManager();
    const existingFile = createFile("existing.png", "image/png");
    const { UploadableFile } = await loadFileTypes();
    const existingEntry: FileUploadMix = {
      type: "upload",
      data: new UploadableFile(existingFile),
      sequence: 0,
    };

    const updated = manager.handleAddFiles(
      [createFile("skip.gif", "image/gif")],
      [existingEntry]
    );

    expect(updated).toEqual([existingEntry]);
  });

  // MARK: removeFile
  it("removes an upload entry without calling the API", async () => {
    const manager = await instantiateFileManager();
    const { UploadableFile } = await loadFileTypes();

    const uploadFile = new UploadableFile(
      createFile("local.png", "image/png", { size: 3 })
    );
    const files: FileUploadMix[] = [
      { type: "upload", data: uploadFile, sequence: 0 },
    ];

    await manager.removeFile(files, uploadFile);

    expect(files).toHaveLength(0);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("removes a persisted file and calls deleteImage", async () => {
    const manager = await instantiateFileManager();
    const { BASE_BACKEND_URL } = await loadBaseUrls();

    const contentImage: ContentImage = {
      id: "img-42",
      fileObject: "file.png",
      creation_date: "2025-10-11T00:00:00Z",
      sequence_index: 0,
    };
    const files: FileUploadMix[] = [
      { type: "file", data: contentImage, sequence: 0 },
    ];

    await manager.removeFile(files, contentImage);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      `${BASE_BACKEND_URL}/content/images/img-42`,
      {
        headers: {
          Authorization: "Bearer test-token",
        },
        method: "DELETE",
      }
    );
    expect(files).toHaveLength(0);
  });

  // MARK: deleteImage
  it("skips API calls when deleteImage receives a falsy id", async () => {
    const manager = await instantiateFileManager();

    await manager.deleteImage("");
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

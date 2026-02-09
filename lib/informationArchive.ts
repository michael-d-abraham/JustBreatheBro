import AsyncStorage from "@react-native-async-storage/async-storage";
import archiveData from "./informationArchive.json";

export type ResourceType = 'article' | 'book' | 'video';

export interface InformationResource {
  id: string;
  name: string;
  link: string;
  type: ResourceType;
  shortDescription: string;
  AI_description: string;
  tags: string[];
}

// Load default data from JSON file
export const defaultResources: InformationResource[] = archiveData as InformationResource[];

// Storage key
const ARCHIVE_KEY = 'information_archive';

/**
 * Get all information resources
 * Returns stored resources if available, otherwise returns default resources from JSON
 */
export const getResources = async (): Promise<InformationResource[]> => {
  const stored = await AsyncStorage.getItem(ARCHIVE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Return default resources from JSON if none stored
  return defaultResources;
};

/**
 * Save resources to AsyncStorage
 * This allows for runtime modifications that persist across app sessions
 */
export const saveResources = async (resources: InformationResource[]): Promise<void> => {
  await AsyncStorage.setItem(ARCHIVE_KEY, JSON.stringify(resources));
};

/**
 * Add a new resource
 */
export const addResource = async (resource: InformationResource): Promise<void> => {
  const resources = await getResources();
  resources.push(resource);
  await saveResources(resources);
};

/**
 * Update an existing resource by ID
 */
export const updateResource = async (id: string, updates: Partial<InformationResource>): Promise<void> => {
  const resources = await getResources();
  const index = resources.findIndex(r => r.id === id);
  if (index !== -1) {
    resources[index] = { ...resources[index], ...updates };
    await saveResources(resources);
  }
};

/**
 * Delete a resource by ID
 */
export const deleteResource = async (id: string): Promise<void> => {
  const resources = await getResources();
  const filtered = resources.filter(r => r.id !== id);
  await saveResources(filtered);
};

/**
 * Get a single resource by ID
 */
export const getResourceById = async (id: string): Promise<InformationResource | null> => {
  const resources = await getResources();
  return resources.find(r => r.id === id) || null;
};

/**
 * Filter resources by type
 */
export const getResourcesByType = async (type: ResourceType): Promise<InformationResource[]> => {
  const resources = await getResources();
  return resources.filter(r => r.type === type);
};

/**
 * Filter resources by tags
 */
export const getResourcesByTags = async (tags: string[]): Promise<InformationResource[]> => {
  const resources = await getResources();
  return resources.filter(r => 
    tags.some(tag => r.tags.includes(tag.toLowerCase()))
  );
};

/**
 * Search resources by name or description
 */
export const searchResources = async (query: string): Promise<InformationResource[]> => {
  const resources = await getResources();
  const lowerQuery = query.toLowerCase();
  return resources.filter(r => 
    r.name.toLowerCase().includes(lowerQuery) ||
    r.shortDescription.toLowerCase().includes(lowerQuery) ||
    r.AI_description.toLowerCase().includes(lowerQuery) ||
    r.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Initialize storage with default data from JSON
 * Only saves if no data exists in storage
 */
export const initializeArchive = async (): Promise<void> => {
  const existing = await AsyncStorage.getItem(ARCHIVE_KEY);
  if (!existing) {
    await saveResources(defaultResources);
  }
};

/**
 * Reset archive to default JSON data (overwrites any stored changes)
 */
export const resetArchiveToDefaults = async (): Promise<void> => {
  await saveResources(defaultResources);
};

/**
 * Clear all stored archive data
 */
export const clearArchive = async (): Promise<void> => {
  await AsyncStorage.removeItem(ARCHIVE_KEY);
};

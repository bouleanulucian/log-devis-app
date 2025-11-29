import { Quote } from '../types';
import { QuoteVersion, VersionDiff } from '../types/extended';

/**
 * VersionService - Manage quote version history
 * Tracks changes and allows version restoration
 */
export class VersionService {
    /**
     * Create a new version of a quote
     */
    static createVersion(
        quote: Quote,
        author: string,
        changes: string
    ): QuoteVersion {
        const versionNumber = (quote.currentVersion || 0) + 1;

        const version: QuoteVersion = {
            id: crypto.randomUUID(),
            quoteId: quote.id,
            versionNumber,
            timestamp: new Date().toISOString(),
            author,
            changes,
            snapshot: JSON.parse(JSON.stringify(quote)) // Deep clone
        };

        return version;
    }

    /**
     * Get version history for a quote
     */
    static getVersionHistory(
        versions: QuoteVersion[],
        quoteId: string
    ): QuoteVersion[] {
        return versions
            .filter(v => v.quoteId === quoteId)
            .sort((a, b) => b.versionNumber - a.versionNumber);
    }

    /**
     * Restore a specific version
     */
    static restoreVersion(
        version: QuoteVersion,
        currentUser: string
    ): Quote {
        // Clone the snapshot and update metadata
        const restored: Quote = JSON.parse(JSON.stringify(version.snapshot));

        return {
            ...restored,
            lastModifiedBy: currentUser,
            lastModifiedAt: new Date().toISOString(),
            status: 'Brouillon' // Reset to draft when restoring
        };
    }

    /**
     * Compare two versions and generate diff
     */
    static compareVersions(v1: QuoteVersion, v2: QuoteVersion): VersionDiff {
        const added: string[] = [];
        const removed: string[] = [];
        const modified: string[] = [];

        const q1 = v1.snapshot;
        const q2 = v2.snapshot;

        // Check basic fields
        if (q1.title !== q2.title) modified.push(`Titre: "${q1.title}" → "${q2.title}"`);
        if (q1.clientName !== q2.clientName) modified.push(`Client: "${q1.clientName}" → "${q2.clientName}"`);
        if (q1.status !== q2.status) modified.push(`Statut: "${q1.status}" → "${q2.status}"`);
        if (q1.totalHT !== q2.totalHT) modified.push(`Total HT: ${q1.totalHT} → ${q2.totalHT}`);

        // Check sections
        const s1Ids = q1.sections.map(s => s.id);
        const s2Ids = q2.sections.map(s => s.id);

        // Find added sections
        s2Ids.forEach(id => {
            if (!s1Ids.includes(id)) {
                const section = q2.sections.find(s => s.id === id);
                added.push(`Section ajoutée: "${section?.title}"`);
            }
        });

        // Find removed sections
        s1Ids.forEach(id => {
            if (!s2Ids.includes(id)) {
                const section = q1.sections.find(s => s.id === id);
                removed.push(`Section supprimée: "${section?.title}"`);
            }
        });

        // Check modified sections
        q1.sections.forEach(section1 => {
            const section2 = q2.sections.find(s => s.id === section1.id);
            if (section2) {
                if (section1.title !== section2.title) {
                    modified.push(`Section renommée: "${section1.title}" → "${section2.title}"`);
                }
                if (section1.items.length !== section2.items.length) {
                    modified.push(`Section "${section1.title}": ${section1.items.length} → ${section2.items.length} lignes`);
                }
            }
        });

        return { added, removed, modified };
    }

    /**
     * Get summary of changes between consecutive versions
     */
    static getChangeSummary(older: QuoteVersion, newer: QuoteVersion): string {
        const diff = this.compareVersions(older, newer);
        const parts: string[] = [];

        if (diff.added.length > 0) parts.push(`+${diff.added.length} ajouts`);
        if (diff.removed.length > 0) parts.push(`-${diff.removed.length} suppressions`);
        if (diff.modified.length > 0) parts.push(`${diff.modified.length} modifications`);

        return parts.length > 0 ? parts.join(', ') : 'Aucun changement';
    }

    /**
     * Create automatic version based on detected changes
     */
    static autoVersion(
        oldQuote: Quote,
        newQuote: Quote,
        author: string
    ): QuoteVersion | null {
        // Detect if significant changes were made
        const hasChanges =
            oldQuote.title !== newQuote.title ||
            oldQuote.clientId !== newQuote.clientId ||
            oldQuote.status !== newQuote.status ||
            oldQuote.totalHT !== newQuote.totalHT ||
            oldQuote.sections.length !== newQuote.sections.length;

        if (!hasChanges) {
            return null; // No significant changes, don't create version
        }

        // Generate auto-summary
        const changes: string[] = [];
        if (oldQuote.title !== newQuote.title) changes.push('titre modifié');
        if (oldQuote.clientId !== newQuote.clientId) changes.push('client changé');
        if (oldQuote.status !== newQuote.status) changes.push(`statut: ${newQuote.status}`);
        if (oldQuote.totalHT !== newQuote.totalHT) changes.push('montant modifié');
        if (oldQuote.sections.length !== newQuote.sections.length) changes.push('sections modifiées');

        const changeSummary = changes.join(', ');

        return this.createVersion(newQuote, author, changeSummary);
    }

    /**
     * Clean up old versions (keep last N versions)
     */
    static cleanupOldVersions(
        versions: QuoteVersion[],
        quoteId: string,
        keepCount: number = 10
    ): QuoteVersion[] {
        const quoteVersions = this.getVersionHistory(versions, quoteId);
        const toKeep = quoteVersions.slice(0, keepCount);
        const toKeepIds = new Set(toKeep.map(v => v.id));

        return versions.filter(v =>
            v.quoteId !== quoteId || toKeepIds.has(v.id)
        );
    }

    /**
     * Export version as JSON
     */
    static exportVersion(version: QuoteVersion): string {
        return JSON.stringify(version, null, 2);
    }

    /**
     * Get version statistics
     */
    static getVersionStats(versions: QuoteVersion[], quoteId: string): {
        totalVersions: number;
        firstVersion: QuoteVersion | null;
        latestVersion: QuoteVersion | null;
        authors: string[];
    } {
        const quoteVersions = this.getVersionHistory(versions, quoteId);

        if (quoteVersions.length === 0) {
            return {
                totalVersions: 0,
                firstVersion: null,
                latestVersion: null,
                authors: []
            };
        }

        const authors = [...new Set(quoteVersions.map(v => v.author))];

        return {
            totalVersions: quoteVersions.length,
            firstVersion: quoteVersions[quoteVersions.length - 1],
            latestVersion: quoteVersions[0],
            authors
        };
    }
}

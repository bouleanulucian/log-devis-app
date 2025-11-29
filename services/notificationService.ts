import { Quote } from '../types';
import { Notification, NotificationType } from '../types/extended';
import { differenceInDays, parseISO } from 'date-fns';

/**
 * NotificationService - Manage application notifications
 * Handles creation, scheduling, and checking of notifications
 */
export class NotificationService {
    /**
     * Check for expiring quotes and generate notifications
     */
    static checkExpiringQuotes(quotes: Quote[], warningDays: number = 7): Notification[] {
        const notifications: Notification[] = [];
        const today = new Date();

        quotes.forEach(quote => {
            // Only check non-expired, non-accepted quotes
            if (['Accepté', 'Facturé', 'Perdu'].includes(quote.status)) {
                return;
            }

            const expiryDate = parseISO(quote.expiryDate);
            const daysUntilExpiry = differenceInDays(expiryDate, today);

            // Create warning if expiring soon
            if (daysUntilExpiry <= warningDays && daysUntilExpiry >= 0) {
                notifications.push(this.createNotification('expiry-warning', {
                    quoteId: quote.id,
                    quoteNumber: quote.number,
                    clientName: quote.clientName,
                    daysUntilExpiry
                }));
            }

            // Create alert if already expired
            if (daysUntilExpiry < 0) {
                notifications.push(this.createNotification('expiry-warning', {
                    quoteId: quote.id,
                    quoteNumber: quote.number,
                    clientName: quote.clientName,
                    daysUntilExpiry,
                    expired: true
                }));
            }
        });

        return notifications;
    }

    /**
     * Create a notification
     */
    static createNotification(type: NotificationType, data: any): Notification {
        const id = crypto.randomUUID();
        const timestamp = new Date().toISOString();

        let title = '';
        let message = '';
        let quoteId: string | undefined;
        let invoiceId: string | undefined;

        switch (type) {
            case 'expiry-warning':
                quoteId = data.quoteId;
                if (data.expired) {
                    title = 'Devis expiré';
                    message = `Le devis ${data.quoteNumber} pour ${data.clientName} a expiré il y a ${Math.abs(data.daysUntilExpiry)} jour(s).`;
                } else {
                    title = 'Devis bientôt expiré';
                    message = `Le devis ${data.quoteNumber} pour ${data.clientName} expire dans ${data.daysUntilExpiry} jour(s).`;
                }
                break;

            case 'approval-request':
                quoteId = data.quoteId;
                title = 'Demande d\'approbation';
                message = `${data.submittedBy} a soumis le devis ${data.quoteNumber} pour approbation.`;
                break;

            case 'status-change':
                quoteId = data.quoteId;
                title = 'Statut modifié';
                message = `Le devis ${data.quoteNumber} est maintenant "${data.newStatus}".`;
                break;

            case 'quote-accepted':
                quoteId = data.quoteId;
                title = 'Devis accepté';
                message = `Le devis ${data.quoteNumber} pour ${data.clientName} a été accepté !`;
                break;

            case 'quote-rejected':
                quoteId = data.quoteId;
                title = 'Devis rejeté';
                message = `Le devis ${data.quoteNumber} a été rejeté. Raison: ${data.reason || 'Non spécifiée'}`;
                break;

            case 'payment-due':
                invoiceId = data.invoiceId;
                title = 'Paiement dû';
                message = `La facture ${data.invoiceNumber} (${data.amount}) arrive à échéance le ${data.dueDate}.`;
                break;

            case 'system':
                title = data.title || 'Notification système';
                message = data.message || '';
                break;
        }

        return {
            id,
            type,
            title,
            message,
            quoteId,
            invoiceId,
            read: false,
            timestamp,
            actionUrl: quoteId ? `/quotes/${quoteId}` : undefined
        };
    }

    /**
     * Mark notification as read
     */
    static markAsRead(notifications: Notification[], notificationId: string): Notification[] {
        return notifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
        );
    }

    /**
     * Mark all notifications as read
     */
    static markAllAsRead(notifications: Notification[]): Notification[] {
        return notifications.map(n => ({ ...n, read: true }));
    }

    /**
     * Delete notification
     */
    static deleteNotification(notifications: Notification[], notificationId: string): Notification[] {
        return notifications.filter(n => n.id !== notificationId);
    }

    /**
     * Clear all notifications
     */
    static clearAll(): Notification[] {
        return [];
    }

    /**
     * Get unread count
     */
    static getUnreadCount(notifications: Notification[]): number {
        return notifications.filter(n => !n.read).length;
    }

    /**
     * Filter notifications by type
     */
    static filterByType(notifications: Notification[], type: NotificationType): Notification[] {
        return notifications.filter(n => n.type === type);
    }

    /**
     * Get recent notifications (last N)
     */
    static getRecent(notifications: Notification[], count: number = 10): Notification[] {
        return notifications
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, count);
    }

    /**
     * Notification for approval workflow
     */
    static createApprovalRequest(quote: Quote, submittedBy: string): Notification {
        return this.createNotification('approval-request', {
            quoteId: quote.id,
            quoteNumber: quote.number,
            submittedBy
        });
    }

    /**
     * Notification for status change
     */
    static createStatusChangeNotification(quote: Quote, oldStatus: string, newStatus: string): Notification {
        return this.createNotification('status-change', {
            quoteId: quote.id,
            quoteNumber: quote.number,
            oldStatus,
            newStatus
        });
    }

    /**
     * Notification for quote acceptance
     */
    static createQuoteAcceptedNotification(quote: Quote): Notification {
        return this.createNotification('quote-accepted', {
            quoteId: quote.id,
            quoteNumber: quote.number,
            clientName: quote.clientName
        });
    }

    /**
     * Notification for quote rejection
     */
    static createQuoteRejectedNotification(quote: Quote, reason?: string): Notification {
        return this.createNotification('quote-rejected', {
            quoteId: quote.id,
            quoteNumber: quote.number,
            reason
        });
    }
}

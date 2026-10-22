import {sqliteTable,text,integer,uniqueIndex,index} from 'drizzle-orm/sqlite-core';
export const submissions=sqliteTable('club_submissions',{
 id:text('id').primaryKey(),type:text('type').notNull(),email:text('email').notNull(),name:text('name').notNull(),details:text('details').notNull(),interests:text('interests').notNull(),consent:integer('consent').notNull().default(0),consentVersion:text('consent_version').notNull(),status:text('status').notNull().default('new'),emailStatus:text('email_status').notNull(),confirmToken:text('confirm_token'),confirmExpires:integer('confirm_expires'),unsubscribeToken:text('unsubscribe_token').notNull(),createdAt:integer('created_at').notNull(),updatedAt:integer('updated_at').notNull(),source:text('source').notNull(),medium:text('medium').notNull(),campaign:text('campaign').notNull(),sessionId:text('session_id').notNull()
},t=>[uniqueIndex('club_email_type').on(t.email,t.type),index('club_created').on(t.createdAt)]);
export const activity=sqliteTable('club_activity',{
 id:text('id').primaryKey(),session:text('session').notNull(),event:text('event').notNull(),target:text('target').notNull(),source:text('source').notNull(),medium:text('medium').notNull(),campaign:text('campaign').notNull(),referrer:text('referrer').notNull(),device:text('device').notNull(),createdAt:integer('created_at').notNull()
},t=>[uniqueIndex('club_activity_once').on(t.session,t.event,t.target),index('club_activity_time').on(t.createdAt)]);
export const rateLimits=sqliteTable('club_rate_limits',{key:text('key').primaryKey(),count:integer('count').notNull(),expiresAt:integer('expires_at').notNull()});
export const emailJobs=sqliteTable('club_email_jobs',{
 id:text('id').primaryKey(),submissionId:text('submission_id').notNull(),kind:text('kind').notNull(),token:text('token'),payload:text('payload').notNull(),status:text('status').notNull(),providerId:text('provider_id'),error:text('error'),createdAt:integer('created_at').notNull(),updatedAt:integer('updated_at').notNull()
},t=>[uniqueIndex('club_email_once').on(t.submissionId,t.kind)]);

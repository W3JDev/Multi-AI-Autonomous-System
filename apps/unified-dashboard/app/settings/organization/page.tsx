'use client';

import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label } from '@repo/ui';
import { APPS } from '../../../lib/types/dashboard';

export default function OrganizationSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Organization Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization and application settings
        </p>
      </div>

      {/* Organization Information */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input id="org-name" defaultValue="W3JDev" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-slug">Slug</Label>
              <Input id="org-slug" defaultValue="w3jdev" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-plan">Subscription Plan</Label>
            <select 
              id="org-plan"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="FREE">Free</option>
              <option value="STARTER">Starter</option>
              <option value="PRO" selected>Pro</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Application Management */}
      <Card>
        <CardHeader>
          <CardTitle>Application Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enable or disable applications for your organization
            </p>
            <div className="space-y-3">
              {APPS.map((app) => (
                <div key={app.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{app.icon}</div>
                    <div>
                      <p className="font-medium">{app.name}</p>
                      <p className="text-sm text-muted-foreground">{app.description}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>AI Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ai-provider">Primary AI Provider</Label>
            <select 
              id="ai-provider"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="gemini">Google Gemini</option>
              <option value="deepseek">DeepSeek</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="auto-fallback" defaultChecked className="h-4 w-4" />
            <Label htmlFor="auto-fallback">Enable auto-fallback to secondary provider</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ai-budget">Monthly AI Budget ($)</Label>
            <Input id="ai-budget" type="number" defaultValue="500" />
          </div>
          <Button>Update AI Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}

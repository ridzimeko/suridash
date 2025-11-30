import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
    const handleSave = () => {
        toast.success('Settings saved successfully');
    };

    const handleUpdateRules = () => {
        toast.success('Rules database update started');
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">
                    Configure Suricata and dashboard settings
                </p>
            </div>

            <Tabs defaultValue="suricata" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="suricata">Suricata Config</TabsTrigger>
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="service">Service Control</TabsTrigger>
                </TabsList>

                <TabsContent value="suricata" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Network Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Network Interface</Label>
                                <Input defaultValue="eth0" />
                            </div>
                            <div className="space-y-2">
                                <Label>HOME_NET</Label>
                                <Input defaultValue="192.168.1.0/24" />
                            </div>
                            <div className="space-y-2">
                                <Label>EXTERNAL_NET</Label>
                                <Input defaultValue="!$HOME_NET" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Detection Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Enable IPS Mode</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Block malicious traffic automatically
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Enable Packet Logging</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Log all packets for analysis
                                    </p>
                                </div>
                                <Switch />
                            </div>
                            <div className="space-y-2">
                                <Label>Max Pending Packets</Label>
                                <Input type="number" defaultValue="1024" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Rules Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Rules Directory</Label>
                                <Input defaultValue="/etc/suricata/rules" />
                            </div>
                            <div className="space-y-2">
                                <Label>Custom Rules File</Label>
                                <Input defaultValue="/etc/suricata/rules/custom.rules" />
                            </div>
                            <Button onClick={handleUpdateRules}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Update Rules Database
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="dashboard" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Display Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Dark Mode</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Use dark theme for the dashboard
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="space-y-2">
                                <Label>Refresh Interval (seconds)</Label>
                                <Input type="number" defaultValue="5" />
                            </div>
                            <div className="space-y-2">
                                <Label>Alerts Per Page</Label>
                                <Input type="number" defaultValue="50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Alert Thresholds</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Critical Alert Threshold</Label>
                                <Input type="number" defaultValue="10" />
                                <p className="text-xs text-muted-foreground">
                                    Trigger notification when critical alerts exceed this number
                                </p>
                            </div>
                            <div className="space-y-2">
                                <Label>Auto-block Threshold</Label>
                                <Input type="number" defaultValue="5" />
                                <p className="text-xs text-muted-foreground">
                                    Automatically block IP after this many alerts
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="service" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Service Management</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Auto-start on Boot</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Start Suricata automatically when system boots
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Auto-restart on Failure</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Automatically restart service if it crashes
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Tuning</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Worker Threads</Label>
                                <Input type="number" defaultValue="4" />
                            </div>
                            <div className="space-y-2">
                                <Label>Memory Limit (MB)</Label>
                                <Input type="number" defaultValue="2048" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex justify-end">
                <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save All Settings
                </Button>
            </div>
        </div>
    );
}
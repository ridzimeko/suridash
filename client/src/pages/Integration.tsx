import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Send, MessageCircle, Save, TestTube } from 'lucide-react';
import { toast } from 'sonner';

export default function Integration() {
    const handleSave = () => {
        toast.success('Integration settings saved successfully');
    };

    const handleTest = (platform: string) => {
        toast.success(`Test notification sent via ${platform}`);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Integration</h1>
                <p className="text-muted-foreground">
                    Configure notification channels for alerts
                </p>
            </div>

            <Tabs defaultValue="email" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="email">
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                    </TabsTrigger>
                    <TabsTrigger value="telegram">
                        <Send className="mr-2 h-4 w-4" />
                        Telegram
                    </TabsTrigger>
                    <TabsTrigger value="whatsapp">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        WhatsApp
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Enable Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Send alerts via email
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>

                            <div className="space-y-2">
                                <Label>SMTP Server</Label>
                                <Input placeholder="smtp.gmail.com" />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>SMTP Port</Label>
                                    <Input type="number" placeholder="587" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Encryption</Label>
                                    <Input placeholder="TLS" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Username</Label>
                                <Input type="email" placeholder="your-email@example.com" />
                            </div>

                            <div className="space-y-2">
                                <Label>Password</Label>
                                <Input type="password" placeholder="••••••••" />
                            </div>

                            <div className="space-y-2">
                                <Label>From Address</Label>
                                <Input type="email" placeholder="suricata@example.com" />
                            </div>

                            <div className="space-y-2">
                                <Label>To Address (comma separated)</Label>
                                <Input placeholder="admin@example.com, security@example.com" />
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={() => handleTest('Email')}>
                                    <TestTube className="mr-2 h-4 w-4" />
                                    Test Connection
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="telegram" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Telegram Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Enable Telegram Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Send alerts via Telegram bot
                                    </p>
                                </div>
                                <Switch />
                            </div>

                            <div className="space-y-2">
                                <Label>Bot Token</Label>
                                <Input placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz" />
                                <p className="text-xs text-muted-foreground">
                                    Get your bot token from @BotFather on Telegram
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Chat ID</Label>
                                <Input placeholder="-1001234567890" />
                                <p className="text-xs text-muted-foreground">
                                    Your personal or group chat ID
                                </p>
                            </div>

                            <div className="rounded-lg bg-muted p-4 space-y-2">
                                <p className="text-sm font-medium">Setup Instructions:</p>
                                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                                    <li>Create a bot using @BotFather on Telegram</li>
                                    <li>Copy the bot token provided</li>
                                    <li>Add the bot to your group or start a chat</li>
                                    <li>Get your chat ID using @userinfobot</li>
                                </ol>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={() => handleTest('Telegram')}>
                                    <TestTube className="mr-2 h-4 w-4" />
                                    Test Connection
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="whatsapp" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>WhatsApp Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Enable WhatsApp Notifications</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Send alerts via WhatsApp Business API
                                    </p>
                                </div>
                                <Switch />
                            </div>

                            <div className="space-y-2">
                                <Label>API Key</Label>
                                <Input placeholder="your-whatsapp-api-key" />
                                <p className="text-xs text-muted-foreground">
                                    Get your API key from WhatsApp Business Platform
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <Input placeholder="+1234567890" />
                                <p className="text-xs text-muted-foreground">
                                    Include country code (e.g., +1 for US)
                                </p>
                            </div>

                            <div className="rounded-lg bg-muted p-4 space-y-2">
                                <p className="text-sm font-medium">Setup Instructions:</p>
                                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                                    <li>Create a WhatsApp Business account</li>
                                    <li>Get API access from Meta Business Platform</li>
                                    <li>Configure webhook for message delivery</li>
                                    <li>Add your phone number to verified list</li>
                                </ol>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={() => handleTest('WhatsApp')}>
                                    <TestTube className="mr-2 h-4 w-4" />
                                    Test Connection
                                </Button>
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
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Send, Save, TestTube } from 'lucide-react';
import { toast } from 'sonner';

import { getIntegrations, saveIntegration, testIntegration } from "@/services/integration";

export default function Integration() {
  const [emailConfig, setEmailConfig] = useState({
    enabled: false,
    config: {
      apiKey: "",
      fromEmail: "",
      fromName: "",
      toEmail: "",
    }
  });

  const [telegramConfig, setTelegramConfig] = useState({
    enabled: false,
    config: {
      bot_token: "",
      chat_id: "",
    }
  });

  const [emailId, setEmailId] = useState<number | null>(null);
  const [telegramId, setTelegramId] = useState<number | null>(null);

  /* ----------------------------------------------
     LOAD CONFIG FROM DATABASE
  ------------------------------------------------*/
  useEffect(() => {
    getIntegrations().then((data: any[]) => {
      data.forEach((row) => {
        if (row.provider === "brevo") {
          setEmailId(row.id);
          setEmailConfig({
            enabled: row.enabled,
            config: row.config,
          });
        }

        if (row.provider === "telegram") {
          setTelegramId(row.id);
          setTelegramConfig({
            enabled: row.enabled,
            config: row.config,
          });
        }
      });
    });
  }, []);

  /* ----------------------------------------------
      SAVE CONFIG
  ------------------------------------------------*/
  const handleSave = async () => {
    try {
      await saveIntegration(
        "brevo",
        emailConfig.config,
        emailConfig.enabled,
        emailId ?? undefined
      );

      await saveIntegration(
        "telegram",
        telegramConfig.config,
        telegramConfig.enabled,
        telegramId ?? undefined
      );

      toast.success("Settings saved!");
    } catch (err) {
      toast.error("Failed to save settings");
    }
  };

  /* ----------------------------------------------
      TEST CONNECTION
  ------------------------------------------------*/
  const handleTest = async (provider: string) => {
    toast.loading("Testing...");

    try {
      const config = provider === "brevo" ? {
        emailTo: emailConfig.config.toEmail
      } : {
        bot_token: telegramConfig.config.bot_token,
        chat_id: telegramConfig.config.chat_id
      };
      const res = await testIntegration(provider, config);
      toast.dismiss();
      toast.success(res.message ?? "Test success!");
    } catch {
      toast.dismiss();
      toast.error("Test failed.");
    }
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
        </TabsList>

        {/* EMAIL TAB */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration (Brevo)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Email Notifications</Label>
                </div>
                <Switch
                  checked={emailConfig.enabled}
                  onCheckedChange={(v) =>
                    setEmailConfig({ ...emailConfig, enabled: v })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Brevo API Key</Label>
                <Input
                  value={emailConfig.config.apiKey}
                  onChange={(e) =>
                    setEmailConfig({
                      ...emailConfig,
                      config: { ...emailConfig.config, apiKey: e.target.value },
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>From Email</Label>
                  <Input
                    value={emailConfig.config.fromEmail}
                    onChange={(e) =>
                      setEmailConfig({
                        ...emailConfig,
                        config: { ...emailConfig.config, fromEmail: e.target.value },
                      })
                    }
                  />
                </div>

                <div>
                  <Label>From Name</Label>
                  <Input
                    value={emailConfig.config.fromName}
                    onChange={(e) =>
                      setEmailConfig({
                        ...emailConfig,
                        config: { ...emailConfig.config, fromName: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>To Email</Label>
                <Input
                  value={emailConfig.config.toEmail}
                  onChange={(e) =>
                    setEmailConfig({
                      ...emailConfig,
                      config: { ...emailConfig.config, toEmail: e.target.value },
                    })
                  }
                />
              </div>

              <Button onClick={() => handleTest("brevo")}>
                <TestTube className="mr-2 h-4 w-4" />
                Test Connection
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TELEGRAM TAB */}
        <TabsContent value="telegram">
          <Card>
            <CardHeader>
              <CardTitle>Telegram Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <Label>Enable Telegram</Label>
                <Switch
                  checked={telegramConfig.enabled}
                  onCheckedChange={(v) =>
                    setTelegramConfig({ ...telegramConfig, enabled: v })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Bot Token</Label>
                <Input
                  value={telegramConfig.config.bot_token}
                  onChange={(e) =>
                    setTelegramConfig({
                      ...telegramConfig,
                      config: { ...telegramConfig.config, bot_token: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Chat ID</Label>
                <Input
                  value={telegramConfig.config.chat_id}
                  onChange={(e) =>
                    setTelegramConfig({
                      ...telegramConfig,
                      config: { ...telegramConfig.config, chat_id: e.target.value },
                    })
                  }
                />
              </div>

              <Button onClick={() => handleTest("telegram")}>
                <TestTube className="mr-2 h-4 w-4" />
                Test Telegram
              </Button>
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

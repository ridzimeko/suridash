import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { mockRules } from '@/lib/mockData';
import type { Rule } from '@/types';
import { Plus, Search, Edit, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import Editor from '@monaco-editor/react';

export default function RulesEditor() {
    const [rules, setRules] = useState<Rule[]>(mockRules);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const filteredRules = rules.filter(
        (rule) =>
            rule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rule.sid.toString().includes(searchTerm)
    );

    const toggleRule = (id: string) => {
        setRules(
            rules.map((rule) =>
                rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
            )
        );
        toast.success('Rule status updated');
    };

    const handleSaveRule = () => {
        toast.success('Rule saved successfully');
        setIsDialogOpen(false);
    };

    const handleDeleteRule = (id: string) => {
        setRules(rules.filter((rule) => rule.id !== id));
        toast.success('Rule deleted successfully');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Rules Editor</h1>
                    <p className="text-muted-foreground">
                        Manage Suricata detection rules
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setSelectedRule(null)}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Rule
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {selectedRule ? 'Edit Rule' : 'Create New Rule'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>SID</Label>
                                    <Input
                                        type="number"
                                        placeholder="Signature ID"
                                        defaultValue={selectedRule?.sid}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Action</Label>
                                    <Input
                                        placeholder="alert, drop, reject"
                                        defaultValue={selectedRule?.action}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input
                                    placeholder="Rule description"
                                    defaultValue={selectedRule?.description}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Input
                                    placeholder="e.g., DDoS Attack, Port Scanning"
                                    defaultValue={selectedRule?.category}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Rule Content</Label>
                                <div className="border rounded-lg overflow-hidden">
                                    <Editor
                                        height="200px"
                                        defaultLanguage="plaintext"
                                        defaultValue={selectedRule?.rule || ''}
                                        theme="vs-dark"
                                        options={{
                                            minimap: { enabled: false },
                                            fontSize: 12,
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSaveRule}>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Rule
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Search Rules</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by SID or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Rules ({filteredRules.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>SID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRules.map((rule) => (
                                <TableRow key={rule.id}>
                                    <TableCell className="font-mono">{rule.sid}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={rule.enabled}
                                            onCheckedChange={() => toggleRule(rule.id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                rule.action === 'drop' ? 'destructive' : 'secondary'
                                            }
                                        >
                                            {rule.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">{rule.category}</TableCell>
                                    <TableCell className="max-w-md truncate text-sm">
                                        {rule.description}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setSelectedRule(rule);
                                                    setIsDialogOpen(true);
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteRule(rule.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
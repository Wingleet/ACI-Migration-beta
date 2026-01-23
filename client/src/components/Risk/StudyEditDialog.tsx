import React, { useState, useEffect } from 'react';
import { ChangeStudy, STUDY_STATUS_LABELS, CHANGE_TYPE_LABELS, StudyStatus, ChangeType } from '@/types/risk';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save } from 'lucide-react';

interface StudyEditDialogProps {
  study: ChangeStudy;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<ChangeStudy>) => void;
}

export const StudyEditDialog: React.FC<StudyEditDialogProps> = ({
  study,
  isOpen,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(study.title);
  const [summary, setSummary] = useState(study.summary);
  const [status, setStatus] = useState<StudyStatus>(study.status);
  const [changeType, setChangeType] = useState<ChangeType>(study.changeType);
  const [targetGoLiveDate, setTargetGoLiveDate] = useState(study.targetGoLiveDate || '');

  useEffect(() => {
    setTitle(study.title);
    setSummary(study.summary);
    setStatus(study.status);
    setChangeType(study.changeType);
    setTargetGoLiveDate(study.targetGoLiveDate || '');
  }, [study]);

  const handleSave = () => {
    onSave({
      title,
      summary,
      status,
      changeType,
      targetGoLiveDate: targetGoLiveDate || null,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-sm">Modifier l'étude</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs">Titre</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-8 text-sm"
              placeholder="Titre de l'étude"
            />
          </div>

          {/* Summary */}
          <div className="space-y-1.5">
            <Label className="text-xs">Résumé</Label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="text-sm min-h-[80px]"
              placeholder="Description de l'étude..."
            />
          </div>

          {/* Status & Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Statut</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as StudyStatus)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STUDY_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Type de changement</Label>
              <Select value={changeType} onValueChange={(v) => setChangeType(v as ChangeType)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CHANGE_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Go-Live Date */}
          <div className="space-y-1.5">
            <Label className="text-xs">Date Go-Live cible</Label>
            <Input
              type="date"
              value={targetGoLiveDate}
              onChange={(e) => setTargetGoLiveDate(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="w-3 h-3 mr-1" />
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

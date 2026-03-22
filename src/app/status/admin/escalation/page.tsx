"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/atoms/dialog";
import { escalationContacts, escalationExpectations } from "@/mocks/status-data";

export default function EscalationPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [ackMinutes, setAckMinutes] = useState(String(escalationExpectations.acknowledgementMinutes));
  const [firstRespMinutes, setFirstRespMinutes] = useState(String(escalationExpectations.firstResponseMinutes));
  const [updateCadence, setUpdateCadence] = useState(String(escalationExpectations.updateCadenceMinutes));

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
        Escalation Configuration
      </h2>

      {/* Contact List */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm">Escalation Contacts</CardTitle>
          <Button
            variant="primary"
            size="sm"
            leadingIcon={<Plus size={14} />}
            onClick={() => setAddOpen(true)}
          >
            Add Contact
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {escalationContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900"
              >
                <GripVertical
                  size={14}
                  className="cursor-grab text-gray-400"
                />
                <Badge variant="secondary" size="sm">
                  #{contact.order}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {contact.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {contact.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Escalation Expectations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Escalation Expectations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Acknowledgement SLA (min)"
              type="number"
              value={ackMinutes}
              onChange={(e) => setAckMinutes(e.target.value)}
              supportiveText="Time to acknowledge an incident"
            />
            <Input
              label="First Response SLA (min)"
              type="number"
              value={firstRespMinutes}
              onChange={(e) => setFirstRespMinutes(e.target.value)}
              supportiveText="Time to first meaningful response"
            />
            <Input
              label="Update Cadence (min)"
              type="number"
              value={updateCadence}
              onChange={(e) => setUpdateCadence(e.target.value)}
              supportiveText="Frequency of updates during active incidents"
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="primary" size="sm">
              Save Expectations
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Contact Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Escalation Contact</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4 py-4">
            <Input
              label="Name"
              placeholder="e.g. On-Call Engineer"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              placeholder="name@kaya.io"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </DialogBody>
          <DialogFooter>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setAddOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setAddOpen(false)}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

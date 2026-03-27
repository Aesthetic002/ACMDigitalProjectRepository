import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, Code, Check, X } from "lucide-react";

/**
 * Role Selection Dialog
 *
 * Shows when user first visits a project page
 * Lets them choose between Viewer or Contributor role
 */
export function RoleSelectionDialog({ open, onSelectRole }) {
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: "viewer",
      title: "Viewer",
      icon: Eye,
      description: "Browse projects and engage with the community",
      permissions: [
        "View all projects",
        "Comment on projects",
        "Like comments",
        "Browse member profiles",
      ],
      gradient: "from-blue-500 to-cyan-400",
      shadow: "shadow-blue-500/20",
    },
    {
      id: "contributor",
      title: "Contributor",
      icon: Code,
      description: "Full access to create and manage projects",
      permissions: [
        "Everything Viewers can do",
        "Create new projects",
        "Edit your projects",
        "Collaborate with team",
      ],
      gradient: "from-purple-500 to-pink-400",
      shadow: "shadow-purple-500/20",
    },
  ];

  const handleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleConfirm = () => {
    if (selectedRole) {
      onSelectRole(selectedRole);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[700px] bg-slate-950 border-border/50 text-white p-0 gap-0">
        <DialogHeader className="p-8 pb-6">
          <DialogTitle className="text-3xl font-black tracking-tight uppercase italic">
            Welcome to ACM Digital
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-base mt-2">
            Choose your role to get started. You can always upgrade later.
          </DialogDescription>
        </DialogHeader>

        <div className="px-8 pb-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;

              return (
                <Card
                  key={role.id}
                  onClick={() => handleSelect(role.id)}
                  className={`
                    relative cursor-pointer transition-all duration-300 
                    border-2 bg-slate-900/50 backdrop-blur-sm
                    hover:scale-[1.02] hover:shadow-xl
                    ${
                      isSelected
                        ? `border-white ${role.shadow} shadow-2xl`
                        : "border-slate-700 hover:border-slate-600"
                    }
                  `}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <div
                        className={`w-8 h-8 bg-gradient-to-br ${role.gradient} rounded-full flex items-center justify-center shadow-lg`}
                      >
                        <Check className="w-5 h-5 text-white" strokeWidth={3} />
                      </div>
                    </div>
                  )}

                  <div className="p-6 space-y-4">
                    {/* Icon */}
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${role.gradient} rounded-2xl flex items-center justify-center ${role.shadow} shadow-xl`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-xl font-black uppercase italic tracking-tight text-white">
                        {role.title}
                      </h3>
                      <p className="text-sm text-slate-400 mt-1">
                        {role.description}
                      </p>
                    </div>

                    {/* Permissions */}
                    <ul className="space-y-2">
                      {role.permissions.map((permission, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-xs text-slate-300"
                        >
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <span>{permission}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Info Banner */}
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
            <p className="text-sm text-slate-300 leading-relaxed">
              <span className="font-bold text-blue-400">Guest Mode:</span> You
              can browse and explore without an account. To comment or create
              projects, you'll be prompted to login.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleConfirm}
              disabled={!selectedRole}
              className={`
                flex-1 h-14 rounded-xl font-black tracking-widest uppercase italic
                transition-all duration-300
                ${
                  selectedRole
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-blue-500/20 hover:scale-[1.02]"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }
              `}
            >
              {selectedRole
                ? `Continue as ${selectedRole === "viewer" ? "Viewer" : "Contributor"}`
                : "Select a role to continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RoleSelectionDialog;

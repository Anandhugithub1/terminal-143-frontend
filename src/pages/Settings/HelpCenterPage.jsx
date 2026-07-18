import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Tag,
  FileText,
  HelpCircle,
  Loader2,
  ChevronDown,
} from "lucide-react";
import PageHeader from '../../shared/components/PageHeader';
import { toast } from "sonner"
import { Listbox } from "@headlessui/react";
import { createSupportCase } from "./api";
import { useMutation } from "@tanstack/react-query";

const categories = [
  { id: "account", name: "Account" },
  { id: "billing", name: "Billing" },
  { id: "technical", name: "Technical" },
  { id: "report", name: "Report User" },
  { id: "other", name: "Other" },
];

export default function HelpCenterPage() {
  const navigate = useNavigate();

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("account");
  const [description, setDescription] = useState("");

  const mutation = useMutation({
  mutationFn: createSupportCase,
  onSuccess: () => {
    toast.success("Support case submitted successfully")
    navigate(-1)
  },
  onError: (err) => {
    toast.error(err.message || "Failed to submit support case")
  },
})

  const submitCase = () => {
    if (!subject.trim()) {
        toast.error("Subject is required")

      return;
    }
    if (description.length > 1000) {
  toast.error("Description cannot exceed 1000 characters")
  return
}

    mutation.mutate({
      subject,
      category,
      description,
    });
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col">
      <PageHeader
        title="Help Center"
        className="sticky top-0 z-10 shadow-sm border-gray-200"
      />

      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <HelpCircle size={32} className="text-primary" />
            </div>

            <h2 className="text-xl font-semibold text-gray-900">Need help?</h2>

            <p className="text-sm text-gray-500 text-center mt-2 max-w-xs">
              Submit a support request and our team will assist you within 24
              hours.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1.5">
                <MessageCircle size={16} className="text-primary" />
                Subject
              </label>

              <input
                type="text"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="e.g. Can't log in to my account"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1.5">
                <Tag size={16} className="text-primary" />
                Category
              </label>

              <Listbox value={category} onChange={setCategory}>
                <div className="relative">
                  <Listbox.Button className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <span>
                      {categories.find((c) => c.id === category)?.name}
                    </span>

                    <ChevronDown size={18} className="text-gray-500" />
                  </Listbox.Button>

                  <Listbox.Options className="absolute mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                    {categories.map((item) => (
                      <Listbox.Option
                        key={item.id}
                        value={item.id}
                        className={({ active }) =>
                          "cursor-pointer px-4 py-3 text-sm " +
                          (active ? "bg-gray-100" : "")
                        }
                      >
                        {({ selected }) => (
                          <span
                            className={
                              selected ? "font-medium text-primary" : ""
                            }
                          >
                            {item.name}{" "}
                          </span>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </div>
              </Listbox>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1.5">
                <FileText size={16} className="text-primary" />
                Description
              </label>

              <textarea
                rows={5}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Please provide as much detail as possible..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <p className="text-xs text-gray-400 mt-1 text-right">
                {description.length}/1000
              </p>
            </div>

            <p className="text-xs text-gray-400 text-center pt-2">
              Our support team typically responds within 24 hours.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={submitCase}
            disabled={mutation.isPending}
            className="w-full bg-primary hover:bg-blue-700 text-white py-3.5 rounded-full font-medium transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Support Request"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

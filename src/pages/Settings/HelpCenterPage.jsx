import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { 
  ArrowLeft, 
  MessageCircle, 
  Tag, 
  FileText, 
  HelpCircle,
  Loader2 
} from "lucide-react"
import { useMutation } from "@tanstack/react-query"

const createSupportCase = async data => {
  const res = await fetch("https://api.passormatch.com/createSupportCase", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  if (!res.ok) {
    throw new Error("Failed to create support case")
  }

  return res.json()
}

export default function HelpCenterPage() {
  const navigate = useNavigate()

  const [subject, setSubject] = useState("")
  const [category, setCategory] = useState("account")
  const [description, setDescription] = useState("")

  const mutation = useMutation({
    mutationFn: createSupportCase,
    onSuccess: () => {
      alert("Support case submitted successfully") // Consider replacing with a toast
      navigate(-1)
    },
    onError: err => {
      alert(err.message) // Consider inline error display
    }
  })

  const submitCase = () => {
    if (!subject.trim()) {
      alert("Subject required")
      return
    }

    mutation.mutate({
      subject,
      category,
      description
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with subtle shadow */}
      <header className="sticky top-0 z-10 flex items-center px-4 py-4 bg-white border-b border-gray-200 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          aria-label="Go back"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="ml-2 text-xl font-semibold text-gray-900">
          Help Center
        </h1>
      </header>

      {/* Main content card */}
      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* Page intro with icon */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
              <HelpCircle size={32} className="text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Need help?
            </h2>
            <p className="text-sm text-gray-500 text-center mt-2 max-w-xs">
              Submit a support request and our team will assist you within 24 hours.
            </p>
          </div>

          {/* Form fields */}
          <div className="space-y-6">
            {/* Subject */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1.5">
                <MessageCircle size={16} className="text-primary" />
                Subject
              </label>
              <input
                type="text"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-focus/20 focus:border-focus transition-shadow"
                placeholder="e.g. Can't log in to my account"
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1.5">
                <Tag size={16} className="text-primary" />
                Category
              </label>
              <select
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-focus/20 focus:border-focus transition-shadow appearance-none"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="account">Account</option>
                <option value="billing">Billing</option>
                <option value="technical">Technical</option>
                <option value="report">Report User</option>
                <option value="other">Other</option>
              </select>
              {/* Custom dropdown arrow */}
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1.5">
                <FileText size={16} className="text-primary" />
                Description
              </label>
              <textarea
                rows={5}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-focus/20 focus:border-focus transition-shadow"
                placeholder="Please provide as much detail as possible..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
              {/* Optional character counter */}
              <p className="text-xs text-gray-400 mt-1 text-right">
                {description.length}/1000
              </p>
            </div>

            {/* Help note */}
            <p className="text-xs text-gray-400 text-center pt-2">
              Our support team typically responds within 24 hours.
            </p>
          </div>
        </div>

        {/* Submit button */}
        <div className="mt-6">
          <button
            onClick={submitCase}
            disabled={mutation.isPending}
            className="w-full bg-primary hover:bg-blue-700 text-white py-3.5 rounded-xl font-medium tracking-wide transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
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
  )
}
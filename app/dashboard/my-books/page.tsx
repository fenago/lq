"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/libs/supabase";
import Link from "next/link";
import toast from "react-hot-toast";

interface UserBook {
  id: string;
  title: string;
  description: string | null;
  github_repo_name: string;
  github_repo_url: string | null;
  github_pages_url: string | null;
  github_username: string;
  status: "draft" | "deployed" | "failed";
  chapters: { id: string; title: string; description: string }[];
  created_at: string;
  updated_at: string;
  last_deployed_at: string | null;
}

export default function MyBooksPage() {
  const [books, setBooks] = useState<UserBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalBook, setDeleteModalBook] = useState<UserBook | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [githubToken, setGithubToken] = useState("");

  const fetchBooks = useCallback(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("user_books")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching books:", error);
      if (error.code === "42P01") {
        toast.error("Please run the migration to create the user_books table");
      }
    } else {
      setBooks(data || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Check if this book uses the default fenago account
  const isFenagoRepo = (book: UserBook) =>
    book.github_username.toLowerCase() === "fenago";

  const handleDelete = async () => {
    if (!deleteModalBook) return;

    // If not fenago repo and no token provided, don't proceed
    if (!isFenagoRepo(deleteModalBook) && !githubToken) {
      toast.error("Please enter your GitHub token");
      return;
    }

    setIsDeleting(true);

    try {
      // Delete the GitHub repository
      const params = new URLSearchParams({
        repo: deleteModalBook.github_repo_name,
        username: deleteModalBook.github_username,
      });

      // Add token if user provided one (for non-fenago repos)
      if (githubToken) {
        params.append("token", githubToken);
      }

      const response = await fetch(`/api/github/delete-repo?${params}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete GitHub repository");
      }

      // Delete from our database
      const supabase = createClient();
      const { error: dbError } = await supabase
        .from("user_books")
        .delete()
        .eq("id", deleteModalBook.id);

      if (dbError) {
        throw new Error("Failed to delete book from database");
      }

      toast.success("Book and repository deleted successfully");
      setDeleteModalBook(null);
      setGithubToken("");
      fetchBooks();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
      console.error(error);
    }

    setIsDeleting(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "deployed":
        return <span className="badge badge-success">Deployed</span>;
      case "failed":
        return <span className="badge badge-error">Failed</span>;
      default:
        return <span className="badge badge-warning">Draft</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Books</h1>
          <p className="text-base-content/60 mt-1">
            Manage your interactive eBooks and GitHub repositories
          </p>
        </div>
        <Link href="/dashboard" className="btn btn-primary">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Book
        </Link>
      </div>

      {/* Books Grid */}
      {books.length === 0 ? (
        <div className="bg-base-100 rounded-lg shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">Create Your First Book</div>
          <h2 className="text-2xl font-bold mb-2">No books yet</h2>
          <p className="text-base-content/60 mb-6 max-w-md mx-auto">
            Start creating your first interactive eBook with executable code,
            exercises, and more.
          </p>
          <Link href="/dashboard" className="btn btn-primary">
            Create Your First Book
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <div key={book.id} className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <h2 className="card-title text-lg">{book.title}</h2>
                  {getStatusBadge(book.status)}
                </div>

                <p className="text-sm text-base-content/60 line-clamp-2">
                  {book.description || "No description"}
                </p>

                <div className="text-xs text-base-content/50 mt-2">
                  <p>Repository: {book.github_username}/{book.github_repo_name}</p>
                  <p>Chapters: {book.chapters?.length || 0}</p>
                  <p>Created: {new Date(book.created_at).toLocaleDateString()}</p>
                </div>

                {/* Action Buttons */}
                <div className="card-actions justify-end mt-4 pt-4 border-t border-base-200">
                  {book.github_pages_url && (
                    <a
                      href={book.github_pages_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-ghost"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View
                    </a>
                  )}
                  {book.github_repo_url && (
                    <a
                      href={book.github_repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-ghost"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      GitHub
                    </a>
                  )}
                  <Link
                    href={`/dashboard/my-books/${book.id}/edit`}
                    className="btn btn-sm btn-ghost"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Link>
                  <button
                    onClick={() => setDeleteModalBook(book)}
                    className="btn btn-sm btn-ghost text-error"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalBook && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">Delete Book</h3>
            <p className="py-4">
              Are you sure you want to delete &quot;{deleteModalBook.title}&quot;?
            </p>
            <p className="text-sm text-base-content/60">
              This will delete both the book and the GitHub repository{" "}
              <span className="font-mono bg-base-200 px-1 rounded">
                {deleteModalBook.github_username}/{deleteModalBook.github_repo_name}
              </span>
              . This action cannot be undone.
            </p>

            {/* Only show token input for non-fenago repos */}
            {!isFenagoRepo(deleteModalBook) && (
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text font-medium">GitHub Personal Access Token</span>
                </label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="ghp_xxxxxxxxxxxx"
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Required to delete repositories on your GitHub account
                  </span>
                </label>
              </div>
            )}

            <div className="modal-action">
              <button
                onClick={() => {
                  setDeleteModalBook(null);
                  setGithubToken("");
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className={`btn btn-error ${isDeleting ? "loading" : ""}`}
                disabled={isDeleting || (!isFenagoRepo(deleteModalBook) && !githubToken)}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop bg-black/50"
            onClick={() => {
              setDeleteModalBook(null);
              setGithubToken("");
            }}
          ></div>
        </div>
      )}
    </div>
  );
}

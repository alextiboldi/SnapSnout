"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { PetForm } from "@/components/pet-form";
import { updatePet, deletePet } from "@/lib/actions/pets";
import type { Pet } from "@/lib/generated/prisma/client";

export default function EditPetClient({ pet }: { pet: Pet }) {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdate = async (formData: FormData) => {
    await updatePet(pet.id, formData);
    router.push("/settings");
    router.refresh();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await deletePet(pet.id);
    router.push("/settings");
    router.refresh();
  };

  return (
    <div className="min-h-dvh bg-clay blueprint-grid">
      <header className="fixed top-0 left-0 right-0 z-50 glass shadow-ambient">
        <div className="flex justify-between items-center px-4 py-3 md:px-6 md:py-4 w-full max-w-3xl mx-auto">
          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="/settings"
              className="p-2 hover:bg-secondary-fixed/20 rounded-full transition-colors spring-active"
            >
              <Icon
                name="arrow_back"
                className="text-primary text-xl md:text-2xl"
              />
            </Link>
            <Image
              src="/snapsout-logo.png"
              alt="SnapSnout"
              width={36}
              height={36}
              className="w-8 h-8 md:w-9 md:h-9"
            />
            <h1 className="text-2xl md:text-3xl font-[800] italic text-primary font-headline tracking-tight">
              SnapSnout
            </h1>
          </div>
        </div>
      </header>

      <main className="pt-20 md:pt-28 pb-16 px-4 md:px-6 max-w-3xl mx-auto">
        <div className="mb-8 md:mb-12 relative animate-fade-up">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-[800] text-primary font-headline italic tracking-tighter mb-3 md:mb-4 leading-[1.05]">
            Edit <br />
            <span className="text-on-surface-variant">{pet.name}</span>
          </h2>
          <p className="text-base md:text-lg text-on-surface-variant max-w-md font-body">
            Update your pet&apos;s details.
          </p>
        </div>

        <PetForm
          initialData={{
            id: pet.id,
            name: pet.name,
            species: pet.species,
            lifestage: pet.lifestage,
            breed: pet.breed ?? "",
            dateOfBirth: pet.dateOfBirth,
            gotchaDay: pet.gotchaDay,
            photoUrl: pet.photoUrl,
            isDeceased: pet.isDeceased,
            deceasedDate: pet.deceasedDate,
          }}
          onSubmit={handleUpdate}
          submitLabel="Save Changes"
          submittingLabel="Saving..."
        />

        {/* Delete Section */}
        <div className="mt-12 pt-8 border-t border-dashed border-outline-variant/30">
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="spring-active flex w-full items-center justify-center gap-2 rounded-2xl p-4 text-error/70 hover:bg-error/5 hover:text-error transition-colors font-headline text-sm font-semibold"
            >
              <Icon name="delete" className="text-xl" />
              Delete {pet.name}
            </button>
          ) : (
            <div className="bg-error-container/10 irregular-border p-6 text-center space-y-4">
              <Icon name="warning" filled className="text-4xl text-error" />
              <p className="font-headline font-bold text-on-surface">
                Are you sure?
              </p>
              <p className="font-body text-sm text-on-surface-variant">
                This will permanently delete {pet.name} and all their
                milestones and photos. This cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-3 rounded-xl bg-surface-container-highest font-headline font-bold text-sm text-on-surface spring-active"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-6 py-3 rounded-xl bg-error text-on-error font-headline font-bold text-sm spring-active disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

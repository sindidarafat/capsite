"use client";
import { MediaLibrary } from "@/components/admin/MediaPicker";
import { Card, PageTitle } from "@/components/admin/ui";

export default function MediaAdmin() {
  return (
    <>
      <PageTitle
        title="Media library"
        sub="Every image and video in the media/ folder — including files copied in directly on the server. Use folders like works/<project-slug>, team, clients, showreel."
      />
      <Card>
        <MediaLibrary accept="any" folder="uploads" />
      </Card>
    </>
  );
}

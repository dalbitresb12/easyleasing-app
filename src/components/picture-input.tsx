import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FC, useRef, useState } from "react";

import { pictureDeleteHandler, pictureHandler, picturePutHandler, usersHandler } from "@/api/handlers";
import { queries } from "@/api/keys";

import { CircularAvatar } from "./circular-avatar";
import { SettingsInput } from "./settings-input";

export const PictureInput: FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [editable, setEditable] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const user = useQuery({ ...queries.users.me, queryFn: usersHandler });
  const picture = useQuery({ ...queries.users.picture, queryFn: pictureHandler });

  const queryClient = useQueryClient();

  const handleCancel = () => {
    setEditable(false);
    setSelectedFile(null);
  };

  const handleSuccess = async () => {
    handleCancel();
    await queryClient.invalidateQueries({ queryKey: queries.users.me.queryKey });
    queryClient.removeQueries({ queryKey: queries.users.picture.queryKey });
    console.log("invalidated queries");
  };

  const picturePutMutation = useMutation({
    mutationFn: picturePutHandler,
    onSuccess: handleSuccess,
  });
  const pictureDeleteMutation = useMutation({
    mutationFn: pictureDeleteHandler,
    onSuccess: handleSuccess,
  });

  const handleSave = () => {
    if (selectedFile) {
      picturePutMutation.mutate(selectedFile);
      setSelectedFile(null);
    }
  };

  const handleDelete = () => {
    pictureDeleteMutation.mutate();
    if (selectedFile) setSelectedFile(null);
  };

  const handleChange = () => {
    const files = inputRef.current?.files;
    if (!(files instanceof FileList)) return;
    if (files.length !== 1) {
      return setSelectedFile(null);
    }
    setSelectedFile(files[0]);
  };

  return (
    <SettingsInput
      label="Foto"
      editable={editable}
      onUpdate={() => setEditable(true)}
      onCancel={handleCancel}
      onSave={handleSave}
      onDelete={handleDelete}
      deletable={picture.isSuccess && picture.data.length !== 0}
    >
      <div className="flex flex-col overflow-x-hidden">
        <CircularAvatar
          placeholder={user.data?.preferredName}
          alt={`foto de perfil de ${user.data?.preferredName}`}
          picture={selectedFile ? URL.createObjectURL(selectedFile) : picture.data}
        />
        {editable && (
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="user"
            multiple={false}
            className="mt-2"
            onChange={handleChange}
          />
        )}
      </div>
    </SettingsInput>
  );
};

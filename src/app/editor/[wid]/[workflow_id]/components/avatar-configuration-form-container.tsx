import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/atoms/dialog';
import { AvatarConfigurationForm } from '@/app/editor/[wid]/[workflow_id]/components/avatar-configuration-form';
import { useEffect } from 'react';
import { useAvatarConfiguration } from '@/hooks/use-avatar-configuration';

interface AvatarConfigurationProps {
    openAvatarConfigForm: boolean;
    setOpenAvatarConfigForm: React.Dispatch<React.SetStateAction<boolean>>;
    setVideoModeSwitch: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AvatarConfigurationFormContainer = (props: AvatarConfigurationProps) => {
    const { openAvatarConfigForm, setOpenAvatarConfigForm } = props;

    useEffect(() => {
        if (openAvatarConfigForm) {
            onEdit();
        }
    }, [openAvatarConfigForm]);

    const handleClose = () => {
        setOpenAvatarConfigForm(false);
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setOpenAvatarConfigForm(false);
        }
        //Don't allow to keep Video mode switch on if there is no avatar configuration saved
        if (allAvatarConfiguration.length === 0) {
            props.setVideoModeSwitch(false);
        }
    };
    const {
        isLoading,
        isFormLoading,
        loading,
        secrets,
        isValid,
        errors,
        control,
        loadingSecrets,
        avatarCreateError,
        allAvatarConfiguration,
        refetch,
        register,
        watch,
        setValue,
        handleSubmit,
        onHandleSubmit,
        onEdit,
        tavusReplicas,
        isLoadingReplicas,
        isReplicasError,
        refetchReplicas,
    } = useAvatarConfiguration({ onClose: handleClose });
    return (
        <Dialog open={openAvatarConfigForm} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[unset] w-[550px]">
                <DialogHeader>
                    <DialogTitle>Configure Video Mode</DialogTitle>
                </DialogHeader>
                <div className="h-fit">
                    <AvatarConfigurationForm
                        isLoading={isLoading}
                        isFormLoading={isFormLoading}
                        loading={loading}
                        secrets={secrets}
                        isValid={isValid}
                        errors={errors}
                        control={control}
                        loadingSecrets={loadingSecrets}
                        avatarCreateError={avatarCreateError}
                        refetch={refetch}
                        register={register}
                        watch={watch}
                        setValue={setValue}
                        handleSubmit={handleSubmit}
                        onHandleSubmit={onHandleSubmit}
                        onEdit={onEdit}
                        tavusReplicas={tavusReplicas}
                        isLoadingReplicas={isLoadingReplicas}
                        isReplicasError={isReplicasError}
                        refetchReplicas={refetchReplicas}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

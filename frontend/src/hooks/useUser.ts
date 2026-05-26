import { updateProfile } from "@/api/user";
import { QueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function useUser(profileId : string) {

    console.log('inside useu user ', profileId);
    

    const queryClient = new QueryClient()

    const updateUserMutation = useMutation({
        mutationKey : ['profile', profileId ],
        mutationFn : updateProfile,

        

        onSuccess : () => {
            queryClient.invalidateQueries({
                queryKey : ['profile', profileId]
            }),

            toast.success("Profile updated successfully")
        },


        onError : (err : any) => {
            console.log('err',err);
            
            toast.error("Failed to update profile")
        }
    })


    return {
        updateUserMutation
    }
}
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    useMutation,
} from '@tanstack/react-query'
import axios from "axios"
import { useForm } from "react-hook-form"
import { Textarea } from "./ui/textarea"

export function CreatePropertyForm() {
    const mutation = useMutation({
        mutationFn: (values) => {
            return axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", values, {
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_PINATA_API_KEY}`,
                }
            }).then(response => {
                console.log("Axios response: ", response) 
            })
        },
        onSuccess: () => {
            // Invalidate and refetch
        },
    })

    
    const form = useForm({
        defaultValues: {
            name: "",
            address: "",
        }
    })
    function onSubmit(values) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log("Pinning metadata to IPFS:", values)
        mutation.mutate(values)
    }

    function onOpenChange(open) {
        if (open == false) {
            form.reset()
        }
    }
    
    return (
        <Dialog onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button>Create Property</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                <DialogTitle>Create Property</DialogTitle>
                <DialogDescription>
                    Add details for your property here. Click save when you're done.
                </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form  className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField 
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                            <FormItem >
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Đại học Bách Khoa Hà Nội" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />   
                        <FormField 
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />             
                        <DialogFooter>
                        <Button type="submit">Save changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default CreatePropertyForm
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
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
import { loadContracts } from "@/lib/contracts"
import {
    useMutation,
} from '@tanstack/react-query'
import axios from "axios"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Textarea } from "./ui/textarea"
import { toast } from "./ui/use-toast"

export function CreatePropertyForm({ getProperties }) {
    const [imageUrl, setImageUrl] = useState('')
    const [isOpened, setIsOpened] = useState(false)
    const mutation = useMutation({
        mutationFn: (values) => {

            const data = {
                pinataOptions: {
                cidVersion: 0
                },
                pinataMetadata: {
                    name: values.name,
                },
                "pinataContent": values
            }
            return axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", data, {
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_PINATA_API_KEY}`,
                }
            }).then(async (response) => {
                const result = response.data
                console.log("Axios response: ", response) 
                setIsOpened(false)
                await mintProperty(result.IpfsHash)
                await getProperties()
            })
        },
        onSuccess: () => {
            // Invalidate and refetch
        },
    })

    const uploadImageMutation = useMutation({
        mutationFn: (file) => { 
            const formData = new FormData()
            formData.append('file',file)
            formData.append('pinataMetadata', JSON.stringify({"name": file.name}))
            return axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_PINATA_API_KEY}`,
                }
            }).then(response => {
                const result = response.data
                const ipfsHash = result.IpfsHash
                form.setValue("imageCid", ipfsHash)
                return response.data
            })
        },
        onSuccess: () => {
            toast({
                description: "Image uploaded to IPFS."
            })
        },
    })

    const uploadToIPFS = async (event) => {
        event.preventDefault()
        const file = event.target.files[0]
        if (typeof file !== 'undefined') {
            try {
                await uploadImageMutation.mutateAsync(file)
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function (e) {
                    setImageUrl(e.target.result)
                }
            } catch (error){
                console.log("ipfs image upload error: ", error)
            }
        }
    }
    const removeImageMutation = useMutation({
        mutationFn: (ipfsHash) => { 
            return axios.delete(`https://api.pinata.cloud/pinning/unpin/${ipfsHash}`, {
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_PINATA_API_KEY}`,
                }
            }).then(response => {
                setImageUrl(null)
                form.setValue("imageCid", "")
                console.log("Axios response: ", response) 
            })
        },
        onSuccess: () => {
            toast({
                description: "Image unpinned from IPFS."
            })
        },
    })

    const onRemoveImage = async () => {
        await removeImageMutation.mutateAsync(form.getValues().imageCid)
    }

    const mintProperty = async (uri) => {
        const {provider, nft} = await loadContracts()
        const signer = await provider.getSigner()
        const mintTransaction = await nft.safeMint(signer.address, uri)
        await provider.waitForTransaction(mintTransaction.hash)
        toast({
            description: "New property minted. Please check your properties."
        })
    }
    
    const form = useForm({
        defaultValues: {
            imageCid: "",
            name: "",
            address: "",
            description: "",
        }
    })
    async function onSubmit(values) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log("Pinning metadata to IPFS:", values)
        await mutation.mutate(values)
    }

    function onOpenChange(open) {
        if (open == false) {
            form.reset()
            setImageUrl("")
        }
        setIsOpened(open)
    }
    
    return (
        <Dialog open={isOpened} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button onClick={() => setIsOpened(true)}>Create Property</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                <DialogTitle>Create Property</DialogTitle>
                <DialogDescription>
                    Add details for your property here. Click save when you're done.
                </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form  className="grid grid-cols-2 gap-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField 
                            control={form.control}
                            name="imageCid"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Document</FormLabel>
                                <div className="space-y-2 col-span-2">
                                    <input id="photo" type="file" accept="image/png, image/jpeg, image/jpg" name="photo" className="hidden" onChange={uploadToIPFS}></input>
                                    {imageUrl ?    
                                        <div className="bg-black/5 object-contain group relative col-span-full h-72 rounded-md overflow-clip border border-solid border-border">
                                            <div onClick={onRemoveImage} className="hidden group-hover:flex absolute justify-center items-center m-auto text-white tracking-wider uppercase bg-transparent h-full w-full hover:bg-black/75 hover:cursor-pointer">
                                                REMOVE
                                            </div>
                                            <img className="object-contain h-full w-full object-center" src={imageUrl} alt="" />
                                        </div> : <div className="space-y-1 grid items-center text-center px-6 w-full h-72 rounded-md overflow-clip border border-solid border-border">
                                            <div className="text-sm text-gray-600 dark:text-gray-400 h-full">
                                                <label className="relative h-full cursor-pointer flex flex-col items-center justify-center bg-transparent rounded-md font-medium text-primary" htmlFor="photo">
                                                    <svg aria-hidden="true" className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                                                    </svg>
                                                    <p className="text-gray-500 space-y-1">
                                                        <span></span>
                                                        <span className="text-primary ">Upload a file</span> or drag and drop
                                                        <span className="block text-xs text-gray-500">PNG, JPG up to 5MB</span>
                                                    </p>
                                                </label>
                                            </div>
                                        </div>
                                    }
                                </div>
                                <FormControl>
                                    <Input {...field} disabled={true}  placeholder="Document IPFS Hash"  />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />   
                        <div className="flex flex-col gap-4">
                                <FormField 
                                
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                <FormItem>
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
                                <FormItem >
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />   
                            <FormField 
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                <FormItem >
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Trường đại học kỹ thuật số 1 Việt Nam" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />         
                        </div>    
                        <DialogFooter className="col-span-full">
                        <Button type="submit">Save changes</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

export default CreatePropertyForm
import { Button } from "@/components/ui/button"

function ProfilePage() {
    return (
        <main className='container py-8 md:py-16'>
            <div className='mb-8 flex flex-row justify-between'>
                <h1 className='text-4xl font-bold'>Profile</h1>
                <div>
                    <Button variant="default">Get More Crypto</Button>
                </div>  
            </div>
            <hr className='my-8'></hr>
        </main>
    )
}

export default ProfilePage
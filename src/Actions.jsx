import useSWR from 'swr'

const Actions = () => {
    const {
        data: airesults,
        error,
        revalidate,
    } = useSWR(
        'http://10.11.33.122:1234/thirdAOI.php',
        async () => {
            const res = await fetch('http://10.11.33.122:1234/thirdAOI.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'get3oaoidata' }),
            })
            const data = await res.json()
            if (data.success) return data.results
            throw new Error(data.msg)
        },
        { revalidateOnFocus: false, revalidateOnReconnect: false },
    )

    if (error) {
        console.error(error.message)
        return <div>商品搜尋失敗</div>
    }

    const searchAiresult = () => {
        revalidate()
        return airesults
    }

    return {
        airesults: airesults || [],
        searchAiresult,
    }
}

export default Actions

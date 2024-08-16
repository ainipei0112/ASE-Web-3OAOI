import useSWR from 'swr'

const Actions = () => {
    const {
        data: aoiData,
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

    const searchThirdAoiData = () => {
        revalidate()
        return aoiData
    }

    return {
        aoiData: aoiData || [],
        searchThirdAoiData,
    }
}

export default Actions
